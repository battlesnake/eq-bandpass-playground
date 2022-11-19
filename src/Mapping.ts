import { Config } from './Types';

const padding = 0.01;
const nonpadding = 1 - (2 * padding);

export class Mapping {

	public readonly fmin: number;
	public readonly fmax: number;

	public readonly width: number;
	public readonly height: number;

	constructor(
		private readonly config: Config,
		canvas: HTMLCanvasElement | null = null,
		public readonly db_min: number = -60,
		public readonly db_max: number = +60,
	) {
		this.fmin = 10;
		this.fmax = Math.min(20000, config.rate / 2);
		this.width = canvas?.width ?? 0;
		this.height = canvas?.height ?? 0;
	}

	project(x: number, y: number): [number, number] {
		const { width, height } = this;
		return [
			(x * nonpadding + padding) * width,
			(y * nonpadding + padding) * height
		];
	}

	level_to_db(level: number): number {
		const { db_min, db_max } = this;
		return Math.min(db_max, Math.max(db_min, 20 * Math.log10(level)));
	}

	i_to_f(i: number): number {
		const { rate, size } = this.config;
		return i * rate / size;
	}

	f_to_i(f: number): number {
		const { size, rate } = this.config;
		return Math.min(size / 2 - 1, Math.max(0, Math.round(f * size / rate)));
	}

	project_x(x: number, xmin: number, xmax: number): number {
		const lx = Math.log(x);
		const lmin = Math.log(xmin);
		const lmax = Math.log(xmax);
		return (lx - lmin) / (lmax - lmin);
	}

	project_f(f: number): number {
		return this.project_x(f, this.fmin, this.fmax);
	}

	project_db(db: number): number {
		const { db_min, db_max } = this;
		return (db_max - db) / (db_max - db_min);
	}

	unproject(u: number, v: number): [number, number] {
		const { width, height } = this;
		return [
			(u / width - padding) / nonpadding,
			(v / height - padding) / nonpadding,
		];
	}

	unproject_f(u: number): number {
		const { fmin, fmax } = this;
		const lmin = Math.log(fmin);
		const lmax = Math.log(fmax);
		return Math.exp(u * (lmax - lmin) + lmin);
	}

	unproject_i(u: number): number {
		const { size, rate } = this.config;
		const f = this.unproject_f(u);
		return this.f_to_i(Math.round(f * size / rate));
	}

	unproject_db(v: number): number {
		const { db_min, db_max } = this;
		return db_max - (v * (db_max - db_min));
	}

}
