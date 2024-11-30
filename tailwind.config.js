/** @type {import('tailwindcss').Config} */
// prettier-ignore
module.exports = {
	content: ["./src/**/*.{html,js,tsx,ts}"],
	theme: {
		extend: {
			fontFamily: {
				Inter: "Inter, ui-serif", // Adds a new `font-display` class
			},
			colors: {
				"main": '#202e3d',
				"secondary": '#314152',
				"tertiary": '#4a5568',
				"highlight": '#b66333',
				"shadow": '#2d3748',
				"border": '#cbd5e0',
				"text": '#2d3748',
				
				"button": '#67476b',
				"button-border": '#ff0000',
				"button-hover": '#36ce31',
			},
			
		},
		
	},
	plugins: [require('tailwindcss-bg-patterns'),],
};
