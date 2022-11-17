import { Config, StrategyName, SpectrumStrategy } from './Types';
import { DefaultModel } from './DefaultModel';
import { ControlsView } from './ControlsView';
import { SpectrumView } from './SpectrumView';
import { CursorView } from './CursorView';
import { MainController } from './MainController';
import { FourierStrategy } from './FourierStrategy';
import { SerialStrategy } from './SerialStrategy';

function start() {
	const strategy_name = (window.location.hash.replace(/^#/, '') as StrategyName) || 'fourier';

	const config: Config = {
		'fourier': { rate: 65536, size: 16384 },
		'sines': { rate: 60000, size: 20000 },
	}[strategy_name];

	const model = new DefaultModel();

	const controls_view = new ControlsView();
	const cursor_view = new CursorView();
	const spectrum_view = new SpectrumView(config);
	const views = [controls_view, cursor_view, spectrum_view];
	const strategy: SpectrumStrategy = {
		'fourier': () => new FourierStrategy(config, model),
		'sines': () => new SerialStrategy(config, model)
	}[strategy_name]();

	const controller = new MainController(config, model, views, strategy);
}

start();
