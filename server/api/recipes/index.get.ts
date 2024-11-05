export default defineEventHandler(async (event) => {
  try {
    const recipes = await useDB().select().from(tables.recipe).all()

    return recipes
  }
  catch (e: unknown) {
    console.error(e)
    throw createError({ statusCode: 500, message: 'Failed to fetch recipes' })
  }
})
//  {
//   // shouldBypassCache: () => !!import.meta.dev,
//   getKey: () => 'recipes',
//   maxAge: 30,
//   staleMaxAge: 300,
// })
