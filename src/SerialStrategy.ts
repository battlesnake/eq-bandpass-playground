import { AnalysisStrategy, Config, Model, Signals, EqBand } from './Types';
import { Mapping } from './Mapping';
import { Equaliser } from './Equaliser';
import { SignalFactory } from './SignalFactory';

export class SerialStrategy implements AnalysisStrategy {

	private readonly sines: Array<{ f: number; y: Float32Array }>;

	constructor(
		private readonly config: Config,
	) {
		const { rate } = this.config;
		const mapping = new Mapping(this.config);
		const lmin = Math.floor(Math.log10(mapping.fmin)) | 0;
		const lmax = Math.ceil(Math.log10(mapping.fmax)) | 0;
		const res = 20;
		const pts = res * (lmax - lmin)
		this.sines = new Array(pts).fill(null).map((_, i) => {
			const lm = i / res + lmin;
			const f = Math.pow(10, lm);
			const period = rate / f;
			const size = period;
			const y = new SignalFactory({ size, rate }).generate_sine(f);
			return { f, y };
		});
	}

	calculate(bands: ReadonlyArray<EqBand>): Float32Array {
		const mapping = new Mapping(this.config);
		const result = new Float32Array(this.sines.length * 2);
		let out_it = 0;
		for (const { f, y } of this.sines) {
			const signal = new Float32Array(y);
			const eq = new Equaliser(this.config, bands);
			eq.apply(signal);
			const level = signal.reduce((a, b) => Math.max(a, Math.abs(b)), 0);
			const db = mapping.level_to_db(level);
			result[out_it++] = f;
			result[out_it++] = db;
		}
		return result;
	}

}
