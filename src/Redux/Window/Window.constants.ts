export const SET_WINDOW_SIZE = 'set_window_size',
	SET_WINDOW_PAGE_OFFSET = 'set_window_page_offset',
	SET_WINDOW_EVENT_TARGET = 'set_window_event_target';

export const INITIAL_WINDOW_STATE = {
	height: window.innerHeight,
	width: window.innerWidth,
	pageXOffset: window.pageXOffset,
	pageYOffset: window.pageYOffset,
	target: window.EventTarget
};
