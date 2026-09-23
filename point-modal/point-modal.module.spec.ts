import { PointModalPage } from './point-modal.page';
import { PointModalPageModule } from './point-modal.module';

describe('PointModalPageModule', () => {
	it('declares and exports PointModalPage so modal templates get ShareModule pipes', () => {
		const def = (PointModalPageModule as any).ɵmod;
		expect(def.declarations).toContain(PointModalPage);
		expect(def.exports).toContain(PointModalPage);
	});
});
