export default eventHandler(async (event) => {
  // const form = await readFormData(event)
  // const file = form.get('file') as File

  // if (!file || !file.size) {
  //   throw createError({ statusCode: 400, message: 'No file provided' })
  // }

  // ensureBlob(file, {
  //   maxSize: '1MB',
  //   types: ['image']
  // })

  // return hubBlob().put(file.name, file, {
  //   addRandomSuffix: false,
  //   prefix: 'images'
  // })

  // https://hub.nuxt.com/docs/storage/blob#handleupload
  return hubBlob().handleUpload(event, {
    multiple: false,
    put: {
      addRandomSuffix: true,
    },
    ensure: {
      maxSize: '1MB',
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/webp'],
    },
  })
})
