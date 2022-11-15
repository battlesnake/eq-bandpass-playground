import { Config, Model, Controller, View } from './Types';
import { Mapping } from './Mapping';

const d3 = require('d3');

export class SpectrumView implements View {

	private viewer_onclick(controller: Controller, e: MouseEvent) {
		const viewer = d3.select(".viewer").node() as HTMLCanvasElement;
		const { rate, size } = this.config;
		const mapping = new Mapping(this.config, viewer.width, viewer.height);
		const [x, y] = mapping.unproject(e.offsetX, e.offsetY);
		const f = mapping.unproject_f(x);
		const i = mapping.f_to_i(f);
		const db = mapping.unproject_db(y);
		controller.set_cursor({ i, f, db });
	}

	constructor(private readonly config: Readonly<Config>) {
	}

	init(controller: Controller) {
		const viewer = d3.select(".viewer").node() as HTMLCanvasElement;
		const observer = new ResizeObserver(() => {
			viewer.width = Math.round(viewer.clientWidth * devicePixelRatio);
			viewer.height = Math.round(viewer.clientHeight * devicePixelRatio);
			controller.update();
		});
		observer.observe(viewer);
		viewer.addEventListener('click', (e) => this.viewer_onclick(controller, e));
	}

	update(model: Model) {
		const viewer = d3.select(".viewer");
		const config = this.config;
		const node = viewer.node() as HTMLCanvasElement;
		const ctx = node.getContext('2d') as CanvasRenderingContext2D;
		const width = node.width;
		const height = node.height;
		ctx.clearRect(0, 0, width, height);
		const mapping = new Mapping(this.config, node.width, node.height);
		const { db_min, db_max } = mapping;
		ctx.globalCompositeOperation = "lighter";
		{
			/* Spectrum */
			ctx.lineWidth = 1;
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(...mapping.project(mapping.project_f(1), mapping.project_db(0)));
			model.spectrum.forEach((d, i) => {
				if (mapping.i_to_f(i) < 1) {
					return;
				}
				ctx.lineTo(...mapping.project(mapping.project_i(i), mapping.project_level(d)));
			});
			ctx.stroke();
		}
		{
			/* EQ profile */
			ctx.lineWidth = 4;
			ctx.strokeStyle = "orange";
			ctx.beginPath();
			ctx.moveTo(...mapping.project(mapping.project_f(1), mapping.project_db(0)));
			for (const { f, g } of model.eq) {
				ctx.lineTo(...mapping.project(mapping.project_f(f), mapping.project_db(g)));
			}
			ctx.lineTo(...mapping.project(mapping.project_f(mapping.fmax), mapping.project_db(0)));
			ctx.stroke();
		}
		{
			/* Frequency gridlines */
			for (let f = 1; f < mapping.fmax; f *= 10) {
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
