import { eq } from 'drizzle-orm'
import { useValidatedParams, zh } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.recipeIds) {
    throw createError({
      statusCode: 400,
      message: 'Missing recipeIds parameter',
    })
  }

  // Parse and validate recipeIds
  const recipeIds = query.recipeIds
    .split(',')
    .map(id => Number(id.trim()))
    .filter(id => !isNaN(id))

  if (recipeIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid recipeIds parameter',
    })
  }

  // Build the `where` condition using `or` with multiple `eq` conditions
  const conditions = recipeIds.map(id => eq(tables.recipe.id, id))
  const whereClause = or(...conditions)

  // Run the query to fetch recipes and ingredients
  const rawResults = await useDB()
    .select({
      recipe: tables.recipe,
      ingredient: tables.ingredient,
    })
    .from(tables.recipe)
    .leftJoin(
      tables.ingredient,
      eq(tables.ingredient.recipeId, tables.recipe.id),
    )
    .where(whereClause)
    .all()

  // Combine all ingredients, avoiding duplicates
  const combinedIngredients = []
  const ingredientIds = new Set()

  rawResults.forEach((row) => {
    const ingredient = row.ingredient
    if (ingredient && !ingredientIds.has(ingredient.id)) {
      combinedIngredients.push(ingredient)
      ingredientIds.add(ingredient.id)
    }
  })

  return combinedIngredients
})
