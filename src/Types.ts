export type AnalysisStrategyName = 'fourier' | 'sines';

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
	readonly q: Readonly<number>;
	readonly eq: ReadonlyArray<EqBand>;
	readonly cursor: Readonly<Cursor>;
	/* (f, db), ... */
	readonly spectrum: Readonly<Float32Array>;

	set_q(value: number): Promise<void>;
	set_gain(band: number, value: number): Promise<void>;
	set_cursor(f: number, db: number): Promise<void>;
}

export interface Controller {
	set_q(value: number): Promise<void>;
	set_gain(index: number, value: number): Promise<void>;
	set_cursor(f: number, db: number): Promise<void>;
}

export interface View {
	bind(controller: Controller): void;
	update(): void;
}

export interface AnalysisStrategy {
	calculate(bands: ReadonlyArray<EqBand>): Promise<Float32Array>;
}
