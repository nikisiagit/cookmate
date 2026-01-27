# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **3D Carousel**: Replaced static carousel with a custom 3D Coverflow-style carousel on the homepage.
- **Categorized Shopping List**: Ingredients in the shopping list are now organized by category (Veg, Fruit, Dairy, Meat/Fish, Bakery, Pantry, Household, Other).
- **Komika Font**: Updated the site font to "Komika" for a more fun and engaging look.
- **Meal Plan Integration**: Added ability to add recipes to the meal plan directly from the "All Recipes" page.
- **Signup Prompt**: Added a prompt for non-authenticated users to create an account when they start building a meal plan.
- **Meal Planner Shopping List**: Updated the standalone Meal Planner page to use the new categorized shopping list view.

### Changed
- **Carousel UI**: Removed navigation dots and added auto-transition with pause on hover.
- **Shopping List Copy**: Updated "Copy to Clipboard" to include category headers in the copied text.
- **Auth UI**: Refactored `LoginForm` to separate Login and Register views.
- **Logo**: Updated CookMate logo to a new design.
- **Font**: Fixed Komika font integration by correcting the font-family naming.
- **Typography**: Added "Instrument Serif" font for paragraph text to improve readability.
- **Logo**: Refreshed CookMate logo with a cleaner design.
- **Accessibility**: Switched secondary font to "Merriweather" for better legibility and improved text contrast.
- **Carousel**: Fixed carousel images being cut off on mobile by adjusting card width and scaling.
