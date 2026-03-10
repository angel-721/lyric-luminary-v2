import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'dark' | 'light';

// Initialize theme from localStorage or default to dark
const initialTheme: Theme = browser
	? ((localStorage.getItem('theme') as Theme) || 'dark')
	: 'dark';

export const theme = writable<Theme>(initialTheme);

// Subscribe to theme changes and persist to localStorage
if (browser) {
	theme.subscribe((value) => {
		localStorage.setItem('theme', value);
		document.documentElement.classList.toggle('light', value === 'light');
	});

	// Apply initial theme on page load
	document.documentElement.classList.toggle('light', initialTheme === 'light');
}

export function toggleTheme() {
	theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}
