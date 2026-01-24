import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: integer('id').primaryKey(),
  email: text('email').unique(),
  nickname: text('nickname').notNull(),
  avatarUrl: text('avatar_url'),
  provider: text('provider').notNull(), // 'google', 'apple', 'password'
  providerId: text('provider_id'), // OAuth provider user ID
  role: text('role').notNull().default('user'), // 'user' or 'admin'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const recipe = sqliteTable('recipe', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  hours: integer('hours').notNull(),
  minutes: integer('minutes').notNull(),
  servings: integer('servings').notNull(),
  difficulty: text('difficulty').notNull(),
  imageUrl: text('image_url'),
  ratings: integer('ratings').notNull(),
  diet: text('diet').notNull(),
  calories: integer('calories').notNull(),
  fat: integer('fat').notNull(),
  protein: integer('protein').notNull(),
  carbs: integer('carbs').notNull(),
  sugar: integer('sugar').notNull(),
  sourceUrl: text('source_url').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const ingredient = sqliteTable('ingredient', {
  id: integer('id').primaryKey(),
  recipeId: integer('recipe_id')
    .references(() => recipe.id)
    .notNull(),
  name: text('name').notNull(),
  qty: real('qty').notNull(),
  unit: text('unit').notNull(),
})

export const step = sqliteTable('step', {
  id: integer('id').primaryKey(),
  recipeId: integer('recipe_id')
    .references(() => recipe.id)
    .notNull(),
  description: text('description').notNull(),
})

export const rating = sqliteTable('rating', {
  id: integer('id').primaryKey(),
  recipeId: integer('recipe_id')
    .references(() => recipe.id)
    .notNull(),
  rating: integer('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
