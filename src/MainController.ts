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

	private update() {
		for (const view of this.views) {
			view.update();
		}
	}

	set_q(value: number) {
		this.model.set_q(value);
		this.update();
	}

	set_gain(index: number, value: number) {
		this.model.set_gain(index, value);
		this.update();
	}

	set_cursor(cursor_f: number, cursor_db: number) {
		this.model.set_cursor(cursor_f, cursor_db);
		this.update();
	}

}
