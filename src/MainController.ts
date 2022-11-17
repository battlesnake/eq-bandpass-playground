import { Signals, Cursor, Config, Model, Controller, View, SpectrumStrategy } from './Types';

export class MainController implements Controller {

	constructor(
		private readonly config: Readonly<Config>,
		private readonly model: Model,
		private readonly views: ReadonlyArray<View>,
		private readonly strategy: SpectrumStrategy
	) {
		for (const view of this.views) {
			view.init(this);
		}
		this.recalculate();
		this.update();
	}

	update() {
		for (const view of this.views) {
			view.update(this.model);
		}
	}

	set_q(value: number) {
		this.model.q = value
		for (const band of this.model.eq) {
			band.q = value;
		}
		this.recalculate();
		this.update();
	}

	set_g(index: number, value: number) {
		this.model.eq[index].g = value;
		this.recalculate();
		this.update();
	}

	interpolate_db(f: number): number | null {
		const spectrum = this.model.spectrum;
		for (let i = 0; i < spectrum.length - 2; i += 2) {
			const f0 = spectrum[i];
			const f1 = spectrum[i + 2];
			if (f >= f0 && f <= f1 && f1 > f0) {
				const lerp = (f - f0) / (f1 - f0);
				const db0 = spectrum[i + 1];
				const db1 = spectrum[i + 3];
				return db0 + lerp * (db1 - db0);
			}
		}
		return null;
	}

	set_cursor(cursor_f: number, cursor_db: number) {
		const value_db = this.interpolate_db(cursor_f);
		this.model.cursor = { cursor_f, cursor_db, value_db };
		this.update();
	}

	recalculate() {
		this.model.spectrum = this.strategy.calculate();
	}

}
