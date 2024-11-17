import type { Recipe } from '~~/types/recipes'

export function recipesDummyData(): Recipe[] {
  return [
    {
      id: 1,
      name: 'Spicy Sausage Pasta with Garlic Crumb',
      description: 'A spicy sausage pasta with a garlic crumb topping.',
      imageUrl:
        'https://pro-cookmate.nuxt.dev/api/images/1174-Red-Pepper--Sausage-Pasta-Garlic-Crumb-x700-9acdfc7d.jpg',
      difficulty: 'Easy',
      hours: 0,
      minutes: 30,
      servings: 2,
      diet: 'Meat',
      calories: 700,
      fat: 30,
      protein: 25,
      carbs: 80,
      sugar: 15,
      sourceUrl:
        'https://www.bonappetit.com/recipe/spicy-sausage-pasta-with-garlic-crumbs',
      createdAt: Date.now(),
      ratings: 4.2,
    },
    {
      id: 2,
      name: 'Creamy Rigatoni with Garlicky Greens and Creme Fraiche',
      description:
        'A creamy pasta dish with a garlicky greens and creme fraiche sauce.',
      imageUrl: 'https://pro-cookmate.nuxt.dev/api/images/creamy-rigatoni-8ff897c2-d7830756-358d1297.avif',
      difficulty: 'Easy',
      hours: 0,
      minutes: 35,
      servings: 2,
      diet: 'Vegetarian',
      calories: 650,
      fat: 25,
      protein: 20,
      carbs: 85,
      sugar: 10,
      sourceUrl:
        'https://www.bonappetit.com/recipe/creamy-rigatoni-with-garlicky-greens',
      createdAt: Date.now(),
      ratings: 4.5,
    },
    {
      id: 3,
      name: 'Harissa Hummus, Roasted Veg & Freekeh Salad',
      description:
        'A delicious salad with harissa hummus, roasted veg, and freekeh.',
      imageUrl:
        'https://pro-cookmate.nuxt.dev/api/images/1358-Harissa-Hummus-Roasted-Veg--Freekeh-Salad-x700.jpg',
      difficulty: 'Easy',
      hours: 0,
      minutes: 30,
      servings: 2,
      diet: 'Vegetarian',
      calories: 600,
      fat: 20,
      protein: 15,
      carbs: 90,
      sugar: 5,
      sourceUrl:
        'https://www.bonappetit.com/recipe/spaghetti-aglio-e-olio-with-lots-of-kale',
      createdAt: Date.now(),
      ratings: 4.0,
    },
  ]
}
