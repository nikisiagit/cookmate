export default defineCachedEventHandler(async (event) => {
  try {
    // Step 1: Fetch all recipes from the cache or database
    const allRecipes = await useDB()
      .select()
      .from(tables.recipe)
      .all()

    if (!allRecipes || allRecipes.length === 0) {
      throw createError({ statusCode: 404, message: 'No recipes found' })
    }

    return allRecipes
  }
  catch (e: unknown) {
    console.error(e)
    throw createError({ statusCode: 500, message: 'Failed to fetch recipes' })
  }
}, {
  maxAge: 30, // Cache valid for 30 seconds
  staleMaxAge: 0, // Optional: serve stale data if cache update fails
  getKey: () => 'all-recipes', // Unique cache key for this handler
})
