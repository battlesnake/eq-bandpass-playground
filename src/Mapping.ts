import { Config } from './Types';

export class Mapping {

	public readonly fmax: number;

	constructor(
		private readonly config: Config,
		public readonly width: number,
		public readonly height: number,
		public readonly db_min: number = -60,
		public readonly db_max: number = +60,
	) {
		this.fmax = config.rate / 2;
	}

	project(x: number, y: number): [number, number] {
		const { width, height } = this;
		return [
			(0.1 + x) * width / 1.2,
			(0.1 + y) * height / 1.2
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

	project_x(x: number, xmax: number): number {
		return Math.log(x) / Math.log(xmax);
	}

	project_f(f: number): number {
		return this.project_x(f, this.fmax);
	}

	project_i(i: number): number {
		return this.project_f(this.i_to_f(i))
	}

	project_db(db: number): number {
		const { db_min, db_max } = this;
		return (db_max - db) / (db_max - db_min);
	}

	project_level(level: number): number {
		return this.project_db(this.level_to_db(level));
	}

	unproject(u: number, v: number): [number, number] {
		const { width, height } = this;
		return [
			u * 1.2 / width - 0.1,
			v * 1.2 / height - 0.1,
		];
	}

	unproject_f(u: number): number {
		const { fmax } = this;
		return Math.exp(u * Math.log(fmax));
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
