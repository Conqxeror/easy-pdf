import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import HomeClient from '@/app/components/HomeClient';

// Simple accessibility test that checks css variables are applied
describe('Theme sanity', () => {
	it('has white primary in light mode', () => {
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add('light');
		render(<HomeClient />);
		const bg = getComputedStyle(document.documentElement).getPropertyValue('--primary');
		expect(bg).toBeTruthy();
		// Primary should be 255 255 255 for light mode
		expect(bg.replace(/\s/g, '')).toContain('255255255');
	});
});
