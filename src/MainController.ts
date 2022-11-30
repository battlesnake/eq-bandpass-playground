import { Signals, Cursor, Config, Model, Controller, View } from './Types';

export class MainController implements Controller {

	constructor(
		private readonly config: Readonly<Config>,
		private readonly model: Model,
		private readonly views: ReadonlyArray<View>
	) {
		for (const view of this.views) {
			view.bind(this);
		}
		this.update();
	}

	private next_view_update: number | null = null;

	private async update() {
		const t0 = +new Date();
		await new Promise((resolve, reject) => {
			if (this.next_view_update !== null) {
				cancelAnimationFrame(this.next_view_update);
			}
			this.next_view_update = requestAnimationFrame(() => {
				this.next_view_update = null;
				Promise.all(this.views.map(view => view.update()))
					.then(resolve, reject);
			});
		});
		const t1 = +new Date();
		console.log(`UI update took ${t1 - t0} ms`);
	}

	async set_q(value: number) {
		await this.model.set_q(value);
		await this.update();
	}

	async set_gain(index: number, value: number) {
		await this.model.set_gain(index, value);
		await this.update();
	}

	async set_cursor(cursor_f: number, cursor_db: number) {
		await this.model.set_cursor(cursor_f, cursor_db);
		await this.update();
	}

}
