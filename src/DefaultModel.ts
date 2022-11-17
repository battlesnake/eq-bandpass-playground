import { Model, SignalType, EqBand, Cursor } from './Types';
import { eq_freq } from './frequencies';

const INITIAL_G = 0;
const INITIAL_Q = 1;

export class DefaultModel implements Model {
	public signal: SignalType = 'noise';
	public q: number = INITIAL_Q;
	public eq: Array<EqBand> = eq_freq.map((f, i) => ({ i, f, g: INITIAL_G, q: INITIAL_Q }));
	public cursor: Cursor = { cursor_f: 0, cursor_db: 0, value_db: null };
	/* (freq, db)... */
	public spectrum: Float32Array = new Float32Array(0);
}
