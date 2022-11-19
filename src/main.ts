import { Config, AnalysisStrategyName, AnalysisStrategy } from './Types';
import { DefaultModel } from './DefaultModel';
import { ControlsView } from './ControlsView';
import { SpectrumView } from './SpectrumView';
import { CursorView } from './CursorView';
import { MainController } from './MainController';
import { FourierStrategy } from './FourierStrategy';
import { SerialStrategy } from './SerialStrategy';

function start() {
	const strategy_name = (window.location.hash.replace(/^#/, '') as AnalysisStrategyName) || 'fourier';

	const config: Config = {
		'fourier': { rate: 65536, size: 32768 },
		'sines': { rate: 60000, size: 20000 },
	}[strategy_name];

	const strategy: AnalysisStrategy = {
		'fourier': () => new FourierStrategy(config),
		'sines': () => new SerialStrategy(config)
	}[strategy_name]();

	const model = new DefaultModel(strategy);

	const controls_view = new ControlsView(model);
	const cursor_view = new CursorView(model);
	const spectrum_view = new SpectrumView(config, model);
	const views = [controls_view, cursor_view, spectrum_view];

	const controller = new MainController(config, model, views);
}

start();
