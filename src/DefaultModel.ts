import { Model, SignalType, EqBand, Cursor, AnalysisStrategy } from './Types';
import { eq_freq } from './frequencies';

const INITIAL_G = 0;
const INITIAL_Q = 1;

export class DefaultModel implements Model {
	public q: number = INITIAL_Q;
	public eq: Array<EqBand> = eq_freq.map((f, i) => ({ i, f, g: INITIAL_G, q: INITIAL_Q }));
	public cursor: Cursor = { cursor_f: 0, cursor_db: 0, value_db: null };
	/* (freq, db)... */
	public spectrum: Float32Array = new Float32Array(0);

	private interpolate_db(f: number): number | null {
		const spectrum = this.spectrum;
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

	private update_cursor() {
		this.cursor.value_db = this.interpolate_db(this.cursor.cursor_f);
	}

	private async update_eq() {
		this.spectrum = await this.strategy.calculate(this.eq);
		this.update_cursor();
	}

	private readonly init: Promise<void>;

	constructor(
		private readonly strategy: AnalysisStrategy
	) {
		this.init = this.update_eq();
	}

	async set_q(value: number) {
		await this.init;
		this.q = value
		for (const band of this.eq) {
			band.q = value;
		}
		await this.update_eq();
	}

	async set_gain(band: number, value: number) {
		await this.init;
		this.eq[band].g = value;
		await this.update_eq();
	}

	async set_cursor(cursor_f: number, cursor_db: number) {
		await this.init;
		this.cursor = { cursor_f, cursor_db, value_db: null };
		this.update_cursor();
	}

}
