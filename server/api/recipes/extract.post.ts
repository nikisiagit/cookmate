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

    // Fetch the HTML content with more realistic headers
    const html = await $fetch<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    console.log('Fetched HTML length:', html.length)

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

    // Extract JSON-LD structured data - try all script tags
    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    let recipe: any = null

    for (const match of jsonLdMatches) {
      try {
        const jsonLd = JSON.parse(match[1])
        console.log('Found JSON-LD type:', jsonLd['@type'] || (Array.isArray(jsonLd) ? jsonLd.map((i: any) => i['@type']).join(', ') : 'unknown'))

        const foundRecipe = Array.isArray(jsonLd)
          ? jsonLd.find((item: any) => item['@type'] === 'Recipe')
          : jsonLd['@type'] === 'Recipe' ? jsonLd : null

        if (foundRecipe) {
          recipe = foundRecipe
          console.log('Found recipe in JSON-LD:', foundRecipe.name || 'unnamed')
          console.log('Recipe has ingredients:', !!foundRecipe.recipeIngredient)
          console.log('Recipe has instructions:', !!foundRecipe.recipeInstructions)
          console.log('Recipe has nutrition:', !!foundRecipe.nutrition)
          break
        }
      } catch (e) {
        console.error('Error parsing JSON-LD block:', e)
      }
    }

    if (recipe) {
      try {
          recipeData.name = recipe.name || ''
          recipeData.description = recipe.description || ''

          // Parse servings/yield - can be number, string with number, or array
          let servings = 2
          if (recipe.recipeYield) {
            if (typeof recipe.recipeYield === 'number') {
              servings = recipe.recipeYield
            } else if (typeof recipe.recipeYield === 'string') {
              const match = recipe.recipeYield.match(/\d+/)
              servings = match ? parseInt(match[0]) : 2
            } else if (Array.isArray(recipe.recipeYield)) {
              servings = parseInt(recipe.recipeYield[0]) || 2
            }
          }
          recipeData.servings = servings

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

          // Parse nutrition - handle both numeric and string values with units
          if (recipe.nutrition) {
            const nutrition = recipe.nutrition
            const parseNutrition = (value: any) => {
              if (typeof value === 'number') return value
              if (typeof value === 'string') {
                const match = value.match(/[\d.]+/)
                return match ? parseFloat(match[0]) : 0
              }
              return 0
            }

            recipeData.calories = parseNutrition(nutrition.calories)
            recipeData.fat = parseNutrition(nutrition.fatContent || nutrition.fat)
            recipeData.protein = parseNutrition(nutrition.proteinContent || nutrition.protein)
            recipeData.carbs = parseNutrition(nutrition.carbohydrateContent || nutrition.carbohydrates || nutrition.carbs)
            recipeData.sugar = parseNutrition(nutrition.sugarContent || nutrition.sugar)
          }

          console.log('Extracted recipe data:', {
            name: recipeData.name,
            ingredientsCount: recipeData.ingredients.length,
            stepsCount: recipeData.steps.length,
            nutrition: { calories: recipeData.calories, fat: recipeData.fat, protein: recipeData.protein, carbs: recipeData.carbs }
          })
        }
      } catch (e) {
        console.error('Error extracting recipe data from JSON-LD:', e)
      }
    }

    // Fallback extractions if JSON-LD didn't work
    if (!recipeData.name) {
      // Try Open Graph title
      const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
      if (ogTitleMatch) {
        recipeData.name = ogTitleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
      }
    }

    if (!recipeData.name) {
      // Try regular title tag
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      if (titleMatch) {
        recipeData.name = titleMatch[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        // Remove common site suffixes
        recipeData.name = recipeData.name.replace(/\s*[\|\-]\s*(Gousto|Recipe|Recipes).*$/i, '')
      }
    }

    if (!recipeData.name) {
      // Try h1 tag
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
      if (h1Match) {
        recipeData.name = h1Match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
      }
    }

    if (!recipeData.description) {
      // Try Open Graph description
      const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
      if (ogDescMatch) {
        recipeData.description = ogDescMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
      }
    }

    if (!recipeData.description) {
      // Try meta description
      const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
      if (metaDescMatch) {
        recipeData.description = metaDescMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
      }
    }

    console.log('Final recipe data:', {
      name: recipeData.name,
      description: recipeData.description ? recipeData.description.substring(0, 50) + '...' : 'none',
      ingredientsCount: recipeData.ingredients.length,
      stepsCount: recipeData.steps.length,
    })

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

    // Check if it's a 403 or blocking error
    if (error.statusCode === 403 || error.message?.includes('403')) {
      throw createError({
        statusCode: 403,
        message: 'The website is blocking automated requests. Try copying and pasting the recipe details manually, or try a different recipe URL.',
      })
    }

    throw createError({
      statusCode: 500,
      message: `Failed to extract recipe data: ${error.message || 'Unknown error'}`,
    })
  }
})
