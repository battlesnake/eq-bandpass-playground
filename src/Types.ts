export type Signal = Float32Array;

export type SignalType = 'noise' | 'pure';

export type Signals = Record<SignalType, Signal>;

export interface Cursor {
	i: number;
	f: number;
	db: number;
}

export interface EqBand {
	i: number;
	f: number;
	g: number;
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
	set_cursor(cursor: Cursor);
}

export interface View {
	init(controller: Controller);
	update(model: Model);
}
