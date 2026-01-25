// Food-themed nickname generator
const adjectives = [
  'Crispy', 'Savory', 'Sweet', 'Spicy', 'Tangy', 'Zesty', 'Fresh', 'Tender',
  'Juicy', 'Golden', 'Creamy', 'Crunchy', 'Fluffy', 'Smoky', 'Sizzling', 'Toasted',
  'Glazed', 'Roasted', 'Grilled', 'Steamed', 'Baked', 'Fried', 'Sauteed', 'Pickled',
  'Caramelized', 'Whipped', 'Melted', 'Frozen', 'Chilled', 'Buttery', 'Herbed', 'Peppered'
]

const foods = [
  'Potato', 'Parsnip', 'Carrot', 'Tomato', 'Pepper', 'Onion', 'Garlic', 'Ginger',
  'Basil', 'Thyme', 'Rosemary', 'Oregano', 'Cilantro', 'Parsley', 'Mint', 'Sage',
  'Mushroom', 'Asparagus', 'Broccoli', 'Cauliflower', 'Spinach', 'Kale', 'Lettuce', 'Cucumber',
  'Avocado', 'Mango', 'Peach', 'Apple', 'Pear', 'Cherry', 'Berry', 'Melon',
  'Noodle', 'Rice', 'Quinoa', 'Lentil', 'Bean', 'Chickpea', 'Tofu', 'Tempeh',
  'Cheese', 'Butter', 'Yogurt', 'Cream', 'Milk', 'Honey', 'Maple', 'Vanilla',
  'Cinnamon', 'Nutmeg', 'Cardamom', 'Cumin', 'Paprika', 'Turmeric', 'Saffron', 'Chili',
  'Bread', 'Bagel', 'Croissant', 'Muffin', 'Pancake', 'Waffle', 'Cookie', 'Brownie',
  'Pasta', 'Pizza', 'Taco', 'Burrito', 'Sushi', 'Ramen', 'Dumpling', 'Pretzel'
]

/**
 * Generates a random food-themed nickname
 * @returns A nickname in the format "AdjectiveFood" (e.g., "CrispyPotato")
 */
export function generateFoodNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const food = foods[Math.floor(Math.random() * foods.length)]
  return `${adjective}${food}`
}

/**
 * Generates a unique food-themed nickname that doesn't exist in the database
 * @param usedNicknames - Array of already used nicknames to avoid duplicates
 * @returns A unique nickname
 */
export function generateUniqueFoodNickname(usedNicknames: string[] = []): string {
  let nickname = generateFoodNickname()
  let attempts = 0
  const maxAttempts = 100

  // Try to generate a unique nickname
  while (usedNicknames.includes(nickname) && attempts < maxAttempts) {
    nickname = generateFoodNickname()
    attempts++
  }

  // If we couldn't find a unique one, append a random number
  if (usedNicknames.includes(nickname)) {
    const randomNum = Math.floor(Math.random() * 9999)
    nickname = `${nickname}${randomNum}`
  }

  return nickname
}
