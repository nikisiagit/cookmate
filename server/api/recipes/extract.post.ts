export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { url } = body

    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'URL is required',
      })
    }

    // Fetch the HTML content
    const html = await $fetch<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    // Initialize recipe data
    let recipeData: any = {
      name: '',
      description: '',
      servings: 2,
      hours: 0,
      minutes: 30,
      difficulty: 'medium',
      diet: 'meat',
      calories: 0,
      fat: 0,
      protein: 0,
      carbs: 0,
      sugar: 0,
      sourceUrl: url,
      ingredients: [],
      steps: [],
    }

    // Extract JSON-LD structured data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1])
        const recipe = Array.isArray(jsonLd) ? jsonLd.find((item: any) => item['@type'] === 'Recipe') : jsonLd['@type'] === 'Recipe' ? jsonLd : null

        if (recipe) {
          recipeData.name = recipe.name || ''
          recipeData.description = recipe.description || ''
          recipeData.servings = parseInt(recipe.recipeYield) || 2

          // Parse time (e.g., "PT30M" or "PT1H30M")
          const timeString = recipe.totalTime || recipe.cookTime || recipe.prepTime || ''
          const timeMatch = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
          if (timeMatch) {
            recipeData.hours = parseInt(timeMatch[1] || '0')
            recipeData.minutes = parseInt(timeMatch[2] || '0')
          }

          // Parse ingredients
          if (recipe.recipeIngredient && Array.isArray(recipe.recipeIngredient)) {
            recipeData.ingredients = recipe.recipeIngredient.map((ing: string) => {
              // Try to parse ingredient string (e.g., "2 cups flour")
              const match = ing.match(/^([\d.\/\s]+)\s*([a-zA-Z]+)?\s*(.+)$/)
              if (match) {
                const [, qtyStr, unit, name] = match
                // Handle fractions like "1/2"
                let qty = 1
                if (qtyStr.includes('/')) {
                  const [num, denom] = qtyStr.trim().split('/').map(s => parseFloat(s))
                  qty = num / denom
                } else {
                  qty = parseFloat(qtyStr.trim()) || 1
                }
                return {
                  qty,
                  unit: unit || 'unit',
                  name: name.trim(),
                }
              }
              return {
                qty: 1,
                unit: 'unit',
                name: ing.trim(),
              }
            })
          }

          // Parse steps
          if (recipe.recipeInstructions) {
            if (Array.isArray(recipe.recipeInstructions)) {
              recipeData.steps = recipe.recipeInstructions.map((step: any) => {
                if (typeof step === 'string') {
                  return { description: step }
                } else if (step.text) {
                  return { description: step.text }
                }
                return { description: '' }
              }).filter((s: any) => s.description)
            } else if (typeof recipe.recipeInstructions === 'string') {
              recipeData.steps = [{ description: recipe.recipeInstructions }]
            }
          }

          // Parse nutrition
          if (recipe.nutrition) {
            const nutrition = recipe.nutrition
            recipeData.calories = parseInt(nutrition.calories) || 0
            recipeData.fat = parseFloat(nutrition.fatContent) || 0
            recipeData.protein = parseFloat(nutrition.proteinContent) || 0
            recipeData.carbs = parseFloat(nutrition.carbohydrateContent) || 0
            recipeData.sugar = parseFloat(nutrition.sugarContent) || 0
          }
        }
      } catch (e) {
        console.error('Error parsing JSON-LD:', e)
      }
    }

    // Fallback: Extract title from <h1> tag if name not found
    if (!recipeData.name) {
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
      if (h1Match) {
        recipeData.name = h1Match[1].replace(/<[^>]*>/g, '').trim()
      }
    }

    // Ensure we have at least minimal data
    if (!recipeData.ingredients.length) {
      recipeData.ingredients = [{ qty: 1, unit: 'unit', name: 'Add ingredients manually' }]
    }
    if (!recipeData.steps.length) {
      recipeData.steps = [{ description: 'Add cooking instructions manually' }]
    }

    return recipeData
  } catch (error: any) {
    console.error('Error extracting recipe:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to extract recipe data: ${error.message}`,
    })
  }
})
