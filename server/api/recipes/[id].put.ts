export default eventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const {
    name,
    description,
    hours,
    minutes,
    servings,
    difficulty,
    imageUrl,
    ingredients,
    steps,
    ratings,
    diet,
    calories,
    fat,
    protein,
    carbs,
    sourceUrl,
  } = body

  // Update recipe
  const recipe = await useDB()
    .update(tables.recipe)
    .set({
      name,
      description,
      hours,
      minutes,
      servings,
      difficulty,
      imageUrl,
      ratings,
      diet,
      calories,
      fat,
      protein,
      carbs,
      sugar: 0,
      sourceUrl,
    })
    .where(eq(tables.recipe.id, Number(id)))
    .returning()
    .get()

  // Delete existing ingredients and steps
  await useDB()
    .delete(tables.ingredient)
    .where(eq(tables.ingredient.recipeId, Number(id)))

  await useDB()
    .delete(tables.step)
    .where(eq(tables.step.recipeId, Number(id)))

  // Insert new ingredients
  if (ingredients && ingredients.length) {
    await useDB()
      .insert(tables.ingredient)
      .values(
        ingredients.map((ingredient: any) => ({
          recipeId: Number(id),
          ...ingredient,
        })),
      )
  }

  // Insert new steps
  if (steps && steps.length) {
    await useDB()
      .insert(tables.step)
      .values(
        steps.map((step: any) => ({
          recipeId: Number(id),
          ...step,
        })),
      )
  }

  return recipe
})
