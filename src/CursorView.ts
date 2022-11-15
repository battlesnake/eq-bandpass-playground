import { Model, Controller, View } from './Types';

const d3 = require('d3');

export class CursorView implements View {

	init(controller: Controller) {
	}

	update(model: Model) {
		const cursor = model.cursor;
		const node = d3.select(".cursor");
		const value_db = 20 * Math.log10(model.spectrum[cursor.i]);
		node.text(`x: ${cursor.f.toFixed(0)} Hz\ny: ${cursor.db.toFixed(2)} dB\nvalue: ${value_db.toFixed(2)} dB`);
	}

}
