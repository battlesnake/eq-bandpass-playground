import { Config, Model, Controller, View } from './Types';
import { Mapping } from './Mapping';

const _ = require('lodash');
const d3 = require('d3');

export class SpectrumView implements View {

	private readonly node: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;

	constructor(
		private readonly config: Readonly<Config>,
		private readonly model: Model
	) {
		const viewer = d3.select(".viewer");
		this.node = viewer.node() as HTMLCanvasElement;
		this.context = this.node.getContext('2d') as CanvasRenderingContext2D;
	}

	private onresize() {
		const width = this.node.clientWidth;
		const height = this.node.clientHeight;
		const ratio = window.devicePixelRatio;
		this.node.width = Math.round(width * ratio);
		this.node.height = Math.round(height * ratio);
		this.update();
	}

	private onmovecursor(controller: Controller, clientX: number, clientY: number) {
		const viewer = d3.select(".viewer").node() as HTMLCanvasElement;
		const { rate, size } = this.config;
		const mapping = new Mapping(this.config, viewer);
		const [x, y] = mapping.unproject(clientX * devicePixelRatio, clientY * devicePixelRatio);
		const f = mapping.unproject_f(x);
		const db = mapping.unproject_db(y);
		controller.set_cursor(f, db);
	}

	private onmousemove(controller: Controller, e: MouseEvent) {
		if (e.buttons & 1) {
			this.onmovecursor(controller, e.clientX, e.clientY);
		}
	}

	private ontouchmove(controller: Controller, e: TouchEvent) {
		const touch = e.touches.item(0);
		if (touch === null) {
			return;
		}
		this.onmovecursor(controller, touch.clientX, touch.clientY);
	}

	bind(controller: Controller) {
		const observer = new ResizeObserver(_.debounce(() => this.onresize(), 40, { leading: true, trailing: true }));
		observer.observe(this.node);
		this.node.addEventListener('mousemove', (e) => this.onmousemove(controller, e));
		this.node.addEventListener('touchmove', (e) => this.ontouchmove(controller, e));
	}

	update() {
		const config = this.config;
		const model = this.model;
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
		{
			/* Cursor */
			const cursor = model.cursor;
			ctx.lineWidth = 8;
			ctx.strokeStyle = "cyan";
			const f = cursor.cursor_f;
			const db = cursor.cursor_db;
			const vdb = cursor.value_db;
			const [cx, cy] = mapping.project(mapping.project_f(f), mapping.project_db(db));
			{
				ctx.beginPath();
				ctx.rect(cx - 1 / width, cy - 1 / height, 2 / width, 2 / height);
				ctx.stroke();
			}
			if (vdb !== null) {
				ctx.setLineDash([4, 4]);
				const [vx, vy] = mapping.project(mapping.project_f(f), mapping.project_db(vdb));
				ctx.beginPath();
				ctx.rect(vx - 1 / width, vy - 1 / height, 2 / width, 2 / height);
				ctx.stroke();
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(vx, vy);
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}
	}

}
