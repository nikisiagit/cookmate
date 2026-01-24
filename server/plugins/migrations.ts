export default defineNitroPlugin(async () => {
  if (!import.meta.dev) return

  const { migrate } = await import('drizzle-orm/d1/migrator')

  onHubReady(async () => {
    await migrate(useDB(), { migrationsFolder: 'server/database/migrations' })
      .then(() => {
        console.log('Database migrations done')
      })
      .catch((err) => {
        console.error('Database migrations failed', err)
      })
  })
})
