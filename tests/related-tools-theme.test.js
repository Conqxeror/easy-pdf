import React from 'react';
import { render } from '@testing-library/react';
import RelatedTools from '@/components/RelatedTools';
import { toolsData } from '@/lib/toolData';

describe('Related Tools theme', () => {
	it('uses bg-card for card background so theme tokens apply', () => {
		const { container } = render(<RelatedTools currentTool={toolsData[0].href} tools={toolsData} />);

		const card = container.querySelector('.bg-card');
		expect(card).toBeTruthy();
	});
});
