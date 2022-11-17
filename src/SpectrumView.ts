import { Config, Model, Controller, View } from './Types';
import { Mapping } from './Mapping';

const d3 = require('d3');

export class SpectrumView implements View {

	private viewer_onclick(controller: Controller, e: MouseEvent) {
		const viewer = d3.select(".viewer").node() as HTMLCanvasElement;
		const { rate, size } = this.config;
		const mapping = new Mapping(this.config, viewer);
		const [x, y] = mapping.unproject(e.clientX * devicePixelRatio, e.clientY * devicePixelRatio);
		const f = mapping.unproject_f(x);
		const db = mapping.unproject_db(y);
		controller.set_cursor(f, db);
	}

	private readonly node: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;

	constructor(private readonly config: Readonly<Config>) {
		const viewer = d3.select(".viewer");
		this.node = viewer.node() as HTMLCanvasElement;
		this.context = this.node.getContext('2d') as CanvasRenderingContext2D;
	}

	init(controller: Controller) {
		const viewer = d3.select(".viewer").node() as HTMLCanvasElement;
		const observer = new ResizeObserver(() => {
			const ratio = window.devicePixelRatio;
			viewer.width = Math.round(viewer.clientWidth * ratio);
			viewer.height = Math.round(viewer.clientHeight * ratio);
			controller.update();
		});
		observer.observe(viewer);
		viewer.addEventListener('click', (e) => this.viewer_onclick(controller, e));
	}

	update(model: Model) {
		const config = this.config;
		const node = this.node;
		const ctx = this.context;
		const width = node.width;
		const height = node.height;
		ctx.clearRect(0, 0, width, height);
		const mapping = new Mapping(config, node);
		const { db_min, db_max } = mapping;
		ctx.globalCompositeOperation = "lighter";
		{
			/* Spectrum */
			ctx.lineWidth = 2;
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(...mapping.project(mapping.project_f(mapping.fmin), mapping.project_db(0)));
			const spectrum = model.spectrum;
			for (let i = 0; i < spectrum.length; i += 2) {
				const f = spectrum[i];
				const db = spectrum[i + 1];
				if (f >= mapping.fmin && f <= mapping.fmax) {
					ctx.lineTo(...mapping.project(mapping.project_f(f), mapping.project_db(db)));
				}
			}
			ctx.stroke();
		}
		{
			/* EQ profile */
			ctx.strokeStyle = "orange";
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(...mapping.project(mapping.project_f(mapping.fmin), mapping.project_db(0)));
			for (const { f, g } of model.eq) {
				ctx.lineTo(...mapping.project(mapping.project_f(f), mapping.project_db(g)));
			}
			ctx.lineTo(...mapping.project(mapping.project_f(mapping.fmax), mapping.project_db(0)));
			ctx.stroke();
			/* Points */
			ctx.lineWidth = 6;
			for (const { f, g } of model.eq) {
				const [x, y] = mapping.project(mapping.project_f(f), mapping.project_db(g));
				ctx.beginPath();
				ctx.rect(x - 1 / width, y - 1 / height, 2 / width, 2 / height);
				ctx.stroke();
			}
		}
		{
			/* Frequency gridlines */
			for (let f = mapping.fmin; f < mapping.fmax; f *= 10) {
				for (let d = 1; d < 10 && f * d < mapping.fmax; d++) {
					ctx.lineWidth = d == 1 ? 4 : 2;
					ctx.strokeStyle = d == 1 ? "blue" : "green";
					ctx.beginPath();
					ctx.moveTo(...mapping.project(mapping.project_f(f * d), 0));
					ctx.lineTo(...mapping.project(mapping.project_f(f * d), 1));
					ctx.stroke();
				}
			}
		}
		{
			/* Level gridlines */
			for (let g = Math.ceil(db_min / 6) * 6; g <= db_max; g += 6) {
				ctx.lineWidth = g == 0 ? 4 : 2;
				ctx.strokeStyle = g == 0 ? "blue" : "green";
				ctx.beginPath();
				ctx.moveTo(...mapping.project(0, mapping.project_db(g)));
				ctx.lineTo(...mapping.project(1, mapping.project_db(g)));
				ctx.stroke();
			}
		}
		{
			/* Bounds */
			ctx.lineWidth = 4;
			ctx.strokeStyle = "silver";
			ctx.beginPath();
			ctx.moveTo(...mapping.project(0, 0));
			ctx.lineTo(...mapping.project(1, 0));
			ctx.lineTo(...mapping.project(1, 1));
			ctx.lineTo(...mapping.project(0, 1));
			ctx.lineTo(...mapping.project(0, 0));
			ctx.stroke();
		}
	}

}
