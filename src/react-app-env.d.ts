/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface RootState {
	windowReducer: WindowReducer;
}

interface WindowReducer {
	height: number;
	width: number;
	pageXOffset: number;
	pageYOffset: number;
	target: EventTarget;
}

interface WindowSize {
	height: number;
	width: number;
}

interface WindowPageOffset {
	pageYOffset: number;
	pageXOffset: number;
}
