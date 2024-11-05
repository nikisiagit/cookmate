import { useValidatedBody, z } from 'h3-zod'

export default eventHandler(async (event) => {
  // const {
  //   name,
  //   description,
  //   time,
  //   servings,
  //   difficulty,
  //   imageUrl,
  //   ingredients,
  //   steps
  //  } = await useValidatedBody(event, {
  //   name: z.string().min(1).max(100),
  //   description: z.string().min(1),
  //   time: z.number().int().min(1),
  //   servings: z.number().int().min(1),
  //   difficulty: z.string().min(1).max(100),
  //   imageUrl: z.string().min(1),

  //   // ingredients: z.array(z.object({
  //   //   name: z.string().min(1).max(100),
  //   //   quantity: z.number().int().min(1),
  //   //   unit: z.string().min(1).max(100)
  //   // })),

  //   // steps: z.array(z.object({
  //   //   description: z.string().min(1),
  //   //   order: z.number().int().min(1)
  //   // }))
  // })

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

  const recipe = await useDB()
    .insert(tables.recipe)
    .values({
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
      createdAt: new Date(),
    })
    .returning()
    .get()

  if (ingredients && ingredients.length) {
    await useDB()
      .insert(tables.ingredient)
      .values(
        ingredients.map(ingredient => ({
          recipeId: recipe.id,
          ...ingredient,
        })),
      )
      .returning()
      .get()
  }

  if (steps && steps.length) {
    await useDB()
      .insert(tables.step)
      .values(
        steps.map(step => ({
          recipeId: recipe.id,
          ...step,
        })),
      )
      .returning()
      .get()
  }

  return recipe
})
