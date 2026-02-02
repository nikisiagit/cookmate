
export type IngredientCategory = 'Veg' | 'Fruit' | 'Dairy' | 'Meat/Fish' | 'Bakery' | 'Pantry' | 'Household' | 'Other'

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
    'Veg': [
        'carrot', 'onion', 'garlic', 'potato', 'tomato', 'spinach', 'lettuce', 'cucumber', 'pepper', 'broccoli',
        'cauliflower', 'cabbage', 'kale', 'zucchini', 'courgette', 'eggplant', 'aubergine', 'mushroom', 'celery',
        'corn', 'peas', 'bean', 'lentil', 'chickpea', 'pulse', 'squash', 'pumpkin', 'beet', 'radish', 'asparagus',
        'leek', 'scallion', 'spring onion', 'chili', 'chilli', 'ginger', 'herb', 'parsley', 'cilantro', 'coriander',
        'basil', 'thyme', 'rosemary', 'sage', 'dill', 'mint', 'veg', 'avocado', 'yam', 'sweet potato', 'arugula',
        'rocket', 'bok choy', 'fennel', 'artichoke'
    ],
    'Fruit': [
        'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'berry', 'strawberry', 'blueberry', 'raspberry',
        'melon', 'watermelon', 'pineapple', 'mango', 'papaya', 'kiwi', 'pear', 'peach', 'plum', 'cherry', 'apricot',
        'fig', 'date', 'raisin', 'pomegranate', 'citrus', 'juice', 'coconut', 'currant', 'cranberry', 'blackberry'
    ],
    'Dairy': [
        'milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'egg', 'margarine', 'ghee', 'curd',
        'mozzarella', 'cheddar', 'parmesan', 'feta', 'brie', 'paneer', 'ricotta', 'mascarpone', 'custard'
    ],
    'Meat/Fish': [
        'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'meat', 'bacon', 'ham', 'sausage', 'salami',
        'fish', 'salmon', 'tuna', 'cod', 'trout', 'shrimp', 'prawn', 'crab', 'lobster', 'mussel', 'clam',
        'oyster', 'seafood', 'steak', 'mince', 'prosciutto', 'chorizo', 'pepperoni', 'pancetta', 'veal', 'venison'
    ],
    'Bakery': [
        'bread', 'bun', 'roll', 'bagel', 'croissant', 'tortilla', 'wrap', 'pita', 'naan', 'baguette',
        'cake', 'muffin', 'cookie', 'biscuit', 'pastry', 'dough', 'flour', 'yeast', 'loaf', 'toast', 'sourdough'
    ],
    'Pantry': [
        'oil', 'vinegar', 'sauce', 'spice', 'salt', 'pepper', 'sugar', 'rice', 'pasta', 'noodle', 'nut', 'seed',
        'honey', 'syrup', 'jam', 'stock', 'broth', 'bullion', 'can', 'tin', 'jar', 'cereal', 'oat', 'grain',
        'quinoa', 'couscous', 'lentil', 'bean', 'chickpea', 'pulse', 'flour', 'baking', 'chocolate', 'cocoa',
        'coffee', 'tea', 'water', 'wine', 'beer', 'spirit', 'alcohol', 'mayonnaise', 'ketchup', 'mustard',
        'dressing', 'pickle', 'olive', 'capers'
    ],
    'Household': [
        'soap', 'cleaner', 'detergent', 'towel', 'foil', 'wrap', 'paper', 'tissue', 'bag', 'sponge', 'shampoo',
        'conditioner', 'toothpaste', 'brush', 'floss', 'razor', 'bleach'
    ],
    'Other': [] // Fallback
}

export function categorizeIngredient(name: string): IngredientCategory {
    const normalizedName = name.toLowerCase()

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'Other') continue
        if (keywords.some(keyword => {
            // Check for whole word match to avoid false positives (e.g. "grape" in "grapefruit" is fine, but "pot" in "potato"?? No, simple includes is fine for now but let's be careful)
            // sticking to includes for simplicity as ingredients are usually descriptive strings
            return normalizedName.includes(keyword)
        })) {
            return category as IngredientCategory
        }
    }

    return 'Other'
}
