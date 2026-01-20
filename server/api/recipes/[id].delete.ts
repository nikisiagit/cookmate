export default eventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Delete ingredients and steps first (foreign key constraints)
  await useDB()
    .delete(tables.ingredient)
    .where(eq(tables.ingredient.recipeId, Number(id)))

  await useDB()
    .delete(tables.step)
    .where(eq(tables.step.recipeId, Number(id)))

  // Delete recipe
  const recipe = await useDB()
    .delete(tables.recipe)
    .where(eq(tables.recipe.id, Number(id)))
    .returning()
    .get()

  return { success: true, recipe }
})
