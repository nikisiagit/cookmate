
import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        './app/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Komika', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            },
        }
    }
}
