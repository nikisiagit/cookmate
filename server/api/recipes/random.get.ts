interface Recipe {
  id: number
  name: string
  imageUrl: string
  hours?: number
  minutes?: number
  servings: number
  description: string
}

export default defineEventHandler(async (event) => {
  try {
    // Step 1: Define and parse query parameters
    const query = getQuery(event)
    const limit = query.limit ? parseInt(query.limit as string, 10) : 7
    const excludedIds = query.excludedIds
      ? (query.excludedIds as string).split(',').map(id => parseInt(id, 10))
      : []

    // Step 2: Fetch all recipes (basic info only)
    const allRecipes: Recipe[] = await $fetch('/api/recipes/list')

    if (!allRecipes || allRecipes.length === 0) {
      throw createError({ statusCode: 404, message: 'No recipes found' })
    }

    // Step 3: Filter out recipes with IDs in the excludedIds array
    const filteredRecipes = allRecipes.filter(
      recipe => !excludedIds.includes(recipe.id),
    )

    // Step 4: Shuffle the array and take the first `limit` elements
    const selectedRecipes = filteredRecipes
      .sort(() => 0.5 - Math.random())
      .slice(0, limit)

    // Step 5: Fetch full details (including ingredients and steps) for each selected recipe
    const randomRecipesWithDetails = await Promise.all(
      selectedRecipes.map(async (recipe) => {
        try {
          const fullRecipe = await $fetch(`/api/recipes/${recipe.id}`)
          return fullRecipe
        } catch (err) {
          console.error(`Failed to fetch details for recipe ${recipe.id}:`, err)
          // Return basic recipe if full details fail
          return recipe
        }
      })
    )

    return randomRecipesWithDetails
  }
  catch (e) {
    console.error(e)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch random recipes',
    })
  }
})
