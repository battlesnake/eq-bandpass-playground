export type StrategyName = 'fourier' | 'sines';

export type Signal = Float32Array;

export type SignalType = 'noise' | 'pure';

export type Signals = Record<SignalType, Signal>;

export interface Cursor {
	cursor_f: number;
	cursor_db: number;
	value_db: number | null;
}

export interface EqBand {
	i: number;
	f: number;
	g: number;
	q: number;
}

export interface Config {
	readonly rate: number;
	readonly size: number;
}

export interface Model {
	signal: SignalType;
	q: number;
	eq: Array<EqBand>;
	cursor: Cursor;
	spectrum: Float32Array;
}

export interface Controller {
	update();
	set_q(value: number);
	set_g(index: number, value: number);
	set_cursor(f: number, db: number);
}

export interface View {
	init(controller: Controller);
	update(model: Model);
}

export interface SpectrumStrategy {
	calculate(): Float32Array;
}
