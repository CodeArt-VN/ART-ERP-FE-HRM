import { buildResetTemplatePromptInputs, parseSelectedTemplateId, resolveResetTemplateId } from './timesheet-template-detail.cycle';

describe('timesheet-template-detail cycle reset helpers', () => {
	const templates = [
		{ Id: 10, Name: 'Template A' },
		{ Id: 20, Name: 'Template B' },
		{ Id: 30, Code: 'TPL-C' },
	];

	it('builds radio inputs and checks the default template', () => {
		const inputs = buildResetTemplatePromptInputs(templates, 20);
		expect(inputs.length).toBe(3);
		expect(inputs[1]).toEqual({ type: 'radio', label: 'Template B (current)', value: '20', checked: true });
		expect(inputs[0].checked).toBe(false);
		expect(inputs[2].label).toBe('TPL-C');
	});

	it('coerces string ids when matching the default template', () => {
		const inputs = buildResetTemplatePromptInputs(
			[
				{ Id: '10' as any, Name: 'A' },
				{ Id: '20' as any, Name: 'B' },
			],
			'20' as any
		);
		expect(inputs[1].checked).toBe(true);
		expect(inputs[1].label).toContain('(current)');
	});

	it('falls back to the first template when default is missing', () => {
		const inputs = buildResetTemplatePromptInputs(templates, 999);
		expect(inputs[0].checked).toBe(true);
		expect(inputs[0].label).toBe('Template A');
	});

	it('parses selected radio value to template id', () => {
		expect(parseSelectedTemplateId('20')).toBe(20);
		expect(parseSelectedTemplateId(30)).toBe(30);
		expect(parseSelectedTemplateId({ value: '20' })).toBe(20);
		expect(parseSelectedTemplateId('')).toBeNull();
		expect(parseSelectedTemplateId(null)).toBeNull();
	});

	it('resolves checked radio when alert returns empty selection', () => {
		const inputs = buildResetTemplatePromptInputs(templates, 20);
		expect(resolveResetTemplateId(undefined, inputs)).toBe(20);
		expect(resolveResetTemplateId('30', inputs)).toBe(30);
	});
});
