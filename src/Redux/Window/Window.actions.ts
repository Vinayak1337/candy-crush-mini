import {
	SET_WINDOW_EVENT_TARGET,
	SET_WINDOW_PAGE_OFFSET,
	SET_WINDOW_SIZE
} from './Window.constants';

export const setWindowSize = (size: WindowSize) => ({
	type: SET_WINDOW_SIZE,
	payload: size
});

export const setWindowPageOffset = (pageOffset: WindowPageOffset) => ({
	type: SET_WINDOW_PAGE_OFFSET,
	payload: pageOffset
});

export const setWindowTarget = (target: EventTarget | null) => ({
	type: SET_WINDOW_EVENT_TARGET,
	payload: target
});
