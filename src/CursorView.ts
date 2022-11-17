import { Model, Controller, View } from './Types';

const d3 = require('d3');

export class CursorView implements View {

	init(controller: Controller) {
	}

	update(model: Model) {
		const { cursor_f, cursor_db, value_db } = model.cursor;
		const node = d3.select(".cursor");
		node.text(`x: ${cursor_f.toFixed(0)} Hz\ny: ${cursor_db.toFixed(2)} dB\nvalue: ${value_db?.toFixed(2) ?? "n/a"} dB`);
	}

}
