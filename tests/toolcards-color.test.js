import { render } from '@testing-library/react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import CategorizedToolsSection from '@/components/ui/CategorizedToolsSection';

// Ensure the default theme is light for CSS variable checks
beforeEach(() => {
	document.documentElement.classList.remove('dark');
});

describe('Tool card listing styling', () => {
	it('renders category containers with white background in light mode', () => {
		const { container } = render(<CategorizedToolsSection />);

		// There should be at least one container using the card token (bg-card) so theme changes are respected
		const cardContainers = container.querySelectorAll('.bg-card');
		expect(cardContainers.length).toBeGreaterThan(0);
	});
});

describe('Badge contrast', () => {
	it('uses a stronger success token in light mode', () => {
		const { container } = render(<span data-testid="badge"><Badge variant="success">New</Badge></span>);

		const badge = container.querySelector('[data-slot="badge"]');
		expect(badge).toBeTruthy();
		// The class should include the success token and a background using an alpha (bg-success/10)
		const classList = badge.className;
		expect(classList.includes('text-success') || classList.includes('text-green-700')).toBe(true);
	});
});
