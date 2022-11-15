import { Model, SignalType, EqBand, Cursor } from './Types';
import { eq_freq } from './frequencies';

export class DefaultModel implements Model {
	public signal: SignalType = 'noise';
	public q: number = 1;
	public eq: Array<EqBand> = eq_freq.map((f, i) => ({ i, f, g: 0, }));
	public cursor: Cursor = { i: 0, f: 0, db: 0 };
	public spectrum: Float32Array = new Float32Array(0);
}
