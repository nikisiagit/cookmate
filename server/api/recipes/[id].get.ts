import { eq } from 'drizzle-orm'
import { useValidatedParams, zh } from 'h3-zod'

export default defineEventHandler(async (event) => {
  try {
    console.log('Fetching recipe')
    const { id } = await useValidatedParams(event, {
      id: zh.intAsString,
    })

    // List recipes
    const rawResults = await useDB()
      .select({
        recipe: tables.recipe,
        ingredient: tables.ingredient,
        step: tables.step,
      })
      .from(tables.recipe)
      .leftJoin(tables.ingredient, eq(tables.ingredient.recipeId, tables.recipe.id))
      .leftJoin(tables.step, eq(tables.step.recipeId, tables.recipe.id))
      .where(eq(tables.recipe.id, id))
      .all()

    // Group ingredients and steps by recipe
    const recipes = rawResults.reduce((acc, row) => {
      const { recipe, ingredient, step } = row
      if (!acc[recipe.id]) {
        acc[recipe.id] = {
          ...recipe,
          ingredients: [],
          steps: [],
        }
      }

      // Avoid duplicates and push ingredients if present
      if (ingredient && !acc[recipe.id].ingredients.some(i => i.id === ingredient.id)) {
        acc[recipe.id].ingredients.push(ingredient)
      }

      // Avoid duplicates and push steps if present
      if (step && !acc[recipe.id].steps.some(s => s.id === step.id)) {
        acc[recipe.id].steps.push(step)
      }

      return acc
    }, {})

    // Sort steps by id for each recipe
    Object.values(recipes).forEach((recipe) => {
      recipe.steps.sort((a, b) => a.id - b.id)
    })

    // Convert the recipes object to an array
    const finalResults = Object.values(recipes)

    return finalResults && finalResults.length === 1 ? finalResults[0] : finalResults
  }
  catch (e: unknown) {
    console.error(e)
    throw createError({ statusCode: 500, message: 'Failed to fetch recipe' })
  }
})
