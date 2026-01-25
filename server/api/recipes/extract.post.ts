// Helper function to extract nutrition info from HTML text
function extractNutritionFromText(html: string) {
  const nutrition = {
    calories: 0,
    fat: 0,
    protein: 0,
    carbs: 0,
    sugar: 0,
  }

  // Remove script and style tags to avoid false matches
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Pattern to match nutrition values with various formats
  // Examples: "Calories: 500", "500 calories", "Fat 10g", "10g fat", "Protein: 25 g"
  const patterns = [
    // Calories patterns
    {
      key: 'calories',
      regex: /(?:calories?|energy)[:\s]*(\d+(?:\.\d+)?)\s*(?:kcal|cal)?/i
    },
    {
      key: 'calories',
      regex: /(\d+(?:\.\d+)?)\s*(?:kcal|cal)/i
    },
    // Fat patterns
    {
      key: 'fat',
      regex: /(?:total\s+)?fat[:\s]*(\d+(?:\.\d+)?)\s*g/i
    },
    {
      key: 'fat',
      regex: /(\d+(?:\.\d+)?)\s*g\s*(?:of\s+)?fat/i
    },
    // Protein patterns
    {
      key: 'protein',
      regex: /protein[:\s]*(\d+(?:\.\d+)?)\s*g/i
    },
    {
      key: 'protein',
      regex: /(\d+(?:\.\d+)?)\s*g\s*(?:of\s+)?protein/i
    },
    // Carbohydrate patterns
    {
      key: 'carbs',
      regex: /(?:carbohydrate|carbs?)[:\s]*(\d+(?:\.\d+)?)\s*g/i
    },
    {
      key: 'carbs',
      regex: /(\d+(?:\.\d+)?)\s*g\s*(?:of\s+)?(?:carbohydrate|carbs?)/i
    },
    // Sugar patterns
    {
      key: 'sugar',
      regex: /(?:total\s+)?sugars?[:\s]*(\d+(?:\.\d+)?)\s*g/i
    },
    {
      key: 'sugar',
      regex: /(\d+(?:\.\d+)?)\s*g\s*(?:of\s+)?sugars?/i
    },
  ]

  // Try each pattern
  for (const pattern of patterns) {
    if (nutrition[pattern.key as keyof typeof nutrition] === 0) {
      const match = cleanHtml.match(pattern.regex)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        if (!isNaN(value) && value > 0) {
          nutrition[pattern.key as keyof typeof nutrition] = value
          console.log(`Found ${pattern.key} from text: ${value}`)
        }
      }
    }
  }

  return nutrition
}

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

          console.log('Extracted recipe data from JSON-LD:', {
            name: recipeData.name,
            ingredientsCount: recipeData.ingredients.length,
            stepsCount: recipeData.steps.length,
            nutrition: { calories: recipeData.calories, fat: recipeData.fat, protein: recipeData.protein, carbs: recipeData.carbs }
          })
      } catch (e) {
        console.error('Error extracting recipe data from JSON-LD:', e)
      }
    }

    // If nutrition data is missing, try to extract from page text
    if (recipeData.calories === 0 && recipeData.fat === 0 && recipeData.protein === 0) {
      console.log('No nutrition data in JSON-LD, searching page text...')
      const extractedNutrition = extractNutritionFromText(html)

      if (extractedNutrition.calories > 0 || extractedNutrition.fat > 0 || extractedNutrition.protein > 0) {
        recipeData.calories = extractedNutrition.calories || recipeData.calories
        recipeData.fat = extractedNutrition.fat || recipeData.fat
        recipeData.protein = extractedNutrition.protein || recipeData.protein
        recipeData.carbs = extractedNutrition.carbs || recipeData.carbs
        recipeData.sugar = extractedNutrition.sugar || recipeData.sugar

        console.log('Extracted nutrition from page text:', extractedNutrition)
      }
    }

    // Fallback extractions if JSON-LD didn't work
    // Prioritize actual page content (h1, paragraphs) over meta tags

    if (!recipeData.name) {
      // Try h1 tag first (most likely to be the recipe title)
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
      if (h1Match) {
        let title = h1Match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        // Only use if it looks like a recipe title (not generic site text)
        if (title.length > 5 && !title.match(/^(recipes?|quick|easy|dinner|ideas|home|menu)$/i)) {
          recipeData.name = title
          console.log('Found title from h1 tag:', title)
        }
      }
    }

    if (!recipeData.name) {
      // Try Open Graph title
      const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
      if (ogTitleMatch) {
        recipeData.name = ogTitleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        console.log('Found title from og:title')
      }
    }

    if (!recipeData.name) {
      // Try Twitter title
      const twitterTitleMatch = html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"[^>]*>/i)
      if (twitterTitleMatch) {
        recipeData.name = twitterTitleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        console.log('Found title from twitter:title')
      }
    }

    if (!recipeData.name) {
      // Try regular title tag
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      if (titleMatch) {
        let title = titleMatch[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        // Remove common site suffixes and prefixes
        title = title.replace(/\s*[\|\-]\s*(Gousto|Recipe|Recipes|BBC Good Food|AllRecipes|Food Network|Quick|Easy|Dinner|Ideas).*$/i, '')
        title = title.replace(/^(Recipe|Recipes)[\:\s]+/i, '')
        if (title.length > 5) {
          recipeData.name = title
          console.log('Found title from <title> tag')
        }
      }
    }

    if (!recipeData.name) {
      // Try data-recipe-title or similar attributes
      const dataRecipeTitleMatch = html.match(/data-recipe-title="([^"]*)"/i) ||
                                   html.match(/data-title="([^"]*)"/i)
      if (dataRecipeTitleMatch) {
        recipeData.name = dataRecipeTitleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        console.log('Found title from data attribute')
      }
    }

    if (!recipeData.description) {
      // Try to find a paragraph near the h1 title (most common recipe pattern)
      const h1AndDescPattern = /<h1[^>]*>.*?<\/h1>\s*(?:<[^>]*>)*\s*<p[^>]*>(.*?)<\/p>/is
      const descMatch = html.match(h1AndDescPattern)
      if (descMatch) {
        let desc = descMatch[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        // Only use if it's a substantial description
        if (desc.length > 20 && desc.length < 500) {
          // Limit description length
          if (desc.length > 300) {
            desc = desc.substring(0, 297) + '...'
          }
          recipeData.description = desc
          console.log('Found description from paragraph near h1:', desc.substring(0, 50))
        }
      }
    }

    if (!recipeData.description) {
      // Try to find first substantial paragraph in the page
      const paragraphMatches = html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)
      for (const match of paragraphMatches) {
        let desc = match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        // Look for substantial content that might be a description
        if (desc.length > 30 && desc.length < 500 && !desc.match(/cookie|privacy|terms|subscribe|newsletter/i)) {
          if (desc.length > 300) {
            desc = desc.substring(0, 297) + '...'
          }
          recipeData.description = desc
          console.log('Found description from first substantial paragraph:', desc.substring(0, 50))
          break
        }
      }
    }

    if (!recipeData.description) {
      // Try Open Graph description
      const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
      if (ogDescMatch) {
        recipeData.description = ogDescMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        console.log('Found description from og:description')
      }
    }

    if (!recipeData.description) {
      // Try Twitter description
      const twitterDescMatch = html.match(/<meta[^>]*name="twitter:description"[^>]*content="([^"]*)"[^>]*>/i)
      if (twitterDescMatch) {
        recipeData.description = twitterDescMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        console.log('Found description from twitter:description')
      }
    }

    if (!recipeData.description) {
      // Try meta description
      const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
      if (metaDescMatch) {
        recipeData.description = metaDescMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
        console.log('Found description from meta description')
      }
    }

    console.log('Final recipe data:', {
      name: recipeData.name,
      description: recipeData.description ? recipeData.description.substring(0, 50) + '...' : 'none',
      ingredientsCount: recipeData.ingredients.length,
      stepsCount: recipeData.steps.length,
      htmlSize: html.length,
    })

    // Check if we got a proper recipe page or a redirect/error page
    if (html.length < 5000 || !recipeData.ingredients.length) {
      console.warn('Warning: Page seems too small or missing recipe data. Might be a landing page or blocked request.')

      // If the page is very small and has generic content, it's likely not the recipe page
      if (html.length < 3000 && (!recipeData.name || recipeData.name.match(/quick|easy|dinner|ideas|home|menu|recipes/i))) {
        throw createError({
          statusCode: 400,
          message: 'Unable to extract recipe - the page may be requiring JavaScript, blocking automated access, or the URL may be incorrect. Try copying the recipe details manually.',
        })
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
