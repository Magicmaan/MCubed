/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,tsx,ts}"],
	theme: {
		extend: {
			fontFamily: {
				Inter: "Inter, ui-serif", // Adds a new `font-display` class
			},
		},
	},
	plugins: [],
};
