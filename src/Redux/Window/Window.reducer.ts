import {
	INITIAL_WINDOW_STATE,
	SET_WINDOW_EVENT_TARGET,
	SET_WINDOW_PAGE_OFFSET,
	SET_WINDOW_SIZE
} from './Window.constants';

export const windowReducer = (
	state = INITIAL_WINDOW_STATE,
	action: WindowReducerAction
) => {
	switch (action.type) {
		case SET_WINDOW_SIZE:
			return { ...state, ...action.payload };

		case SET_WINDOW_PAGE_OFFSET:
			return { ...state, ...action.payload };

		case SET_WINDOW_EVENT_TARGET:
			return { ...state, target: action.payload };

		default:
			return state;
	}
};

type WindowReducerAction =
	| {
			type: typeof SET_WINDOW_SIZE;
			payload: WindowSize;
		}
	| {
			type: typeof SET_WINDOW_PAGE_OFFSET;
			payload: WindowPageOffset;
		}
	| {
			type: typeof SET_WINDOW_EVENT_TARGET;
			payload?: EventTarget;
		};
