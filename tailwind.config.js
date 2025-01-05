/** @type {import('tailwindcss').Config} */
// prettier-ignore
module.exports = {
    darkMode: ["selector"],
    content: ["./src/**/*.{html,js,tsx,ts}"],
	theme: {
    	extend: {
    		fontFamily: {
    			Inter: 'Inter, ui-serif'
    		},
    		colors: {
    			'main': {
    				'100': '#e5eaf0',
    				'200': '#b8c2cf',
    				'300': '#8b9aae',
    				'400': '#5e728d',
    				'500': '#202e3d',
    				'600': '#1b2734',
    				'700': '#161f2a',
    				'800': '#111821',
    				'900': '#0c1017',
    				DEFAULT: '#202e3d'
    			},
    			'secondary': {
    				'100': '#e2e8f0',
    				'200': '#cbd5e0',
    				'300': '#a0aec0',
    				'400': '#718096',
    				'500': '#314152',
    				'600': '#2c3a47',
    				'700': '#26323c',
    				'800': '#202933',
    				'900': '#1a2129',
    				DEFAULT: '#314152'
    			},
    			'tertiary': {
    				'100': '#f7fafc',
    				'200': '#edf2f7',
    				'300': '#e2e8f0',
    				'400': '#cbd5e0',
    				'500': '#4a5568',
    				'600': '#3f495a',
    				'700': '#353d4d',
    				'800': '#2c313f',
    				'900': '#232633',
    				DEFAULT: '#4a5568'
    			},
    			'highlight': {
    				'100': '#e2e8f0',
    				'200': '#aac3dd',
    				'300': '#89a8d1',
    				'400': '#6c8ab6',
    				'500': '#516a96',
    				'600': '#415691',
    				'700': '#2a3c75',
    				'800': '#19205a',
    				'900': '#141b3d',
    				DEFAULT: '#516a96'
    			},
    			'shadow': '#2d3748',
    			'border': '#76787a',
    			'text': '#c6cedb',
				'text-secondary': '#9a9fa8',
    			'button': '#67476b',
    			'button-border': '#ff0000',

				'button-selected': '#3498db',
    			'button-hover':  '#355a74'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
	plugins: [require('tailwindcss-bg-patterns'), require("tailwindcss-animate")],
};
