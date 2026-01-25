import { eq, sql } from 'drizzle-orm'
import * as tables from '~~/server/database/schema'

export default eventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Get rating statistics
  const stats = await useDB()
    .select({
      averageRating: sql<number>`COALESCE(AVG(${tables.rating.rating}), 0)`,
      totalRatings: sql<number>`COUNT(*)`,
    })
    .from(tables.rating)
    .where(eq(tables.rating.recipeId, Number(id)))
    .get()

  return {
    averageRating: Number(stats?.averageRating) || 0,
    totalRatings: Number(stats?.totalRatings) || 0,
  }
})
