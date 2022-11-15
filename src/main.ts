import { DefaultModel } from './DefaultModel';
import { ControlsView } from './ControlsView';
import { SpectrumView } from './SpectrumView';
import { CursorView } from './CursorView';
import { MainController } from './MainController';

function start() {
	const config = { rate: 65536, size: 16384 };

	const model = new DefaultModel();

	const controls_view = new ControlsView();
	const cursor_view = new CursorView();
	const spectrum_view = new SpectrumView(config);
	const views = [controls_view, cursor_view, spectrum_view];

	const controller = new MainController(config, model, views);
}

start();
