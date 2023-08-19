/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",],
    theme: {
        extend: {
            gridTemplateColumns: {
                // Simple 16 column grid
                '16': 'repeat(16, minmax(0, 1fr))',
            }
        },
    },
    plugins: [],
}
