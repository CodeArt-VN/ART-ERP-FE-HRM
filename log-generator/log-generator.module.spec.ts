import { LogGeneratorPage } from './log-generator.page';
import { LogGeneratorPageModule } from './log-generator.module';

describe('LogGeneratorPageModule', () => {
	it('declares and exports LogGeneratorPage so modal templates get ShareModule pipes', () => {
		const def = (LogGeneratorPageModule as any).ɵmod;
		expect(def.declarations).toContain(LogGeneratorPage);
		expect(def.exports).toContain(LogGeneratorPage);
	});
});
