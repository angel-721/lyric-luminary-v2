import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'dark' | 'light';

const initialTheme: Theme = browser
	? ((localStorage.getItem('theme') as Theme) || 'dark')
	: 'dark';

export const theme = writable<Theme>(initialTheme);

if (browser) {
	theme.subscribe((value) => {
		localStorage.setItem('theme', value);
		document.documentElement.classList.toggle('light', value === 'light');
	});

	document.documentElement.classList.toggle('light', initialTheme === 'light');
}

export function toggleTheme() {
	theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}