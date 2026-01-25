import { eq } from 'drizzle-orm'
import * as tables from '~~/server/database/schema'

export default eventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { rating } = body

  if (!rating || rating < 1 || rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating must be between 1 and 5',
    })
  }

  const newRating = await useDB()
    .insert(tables.rating)
    .values({
      recipeId: Number(id),
      rating: Number(rating),
      createdAt: new Date(),
    })
    .returning()
    .get()

  return { success: true, rating: newRating }
})
