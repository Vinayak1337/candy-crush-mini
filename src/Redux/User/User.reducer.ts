import {
	INITIAL_USER_STATE,
	SET_USER,
	SET_USER_AVATAR,
	SET_USER_DIFFICULTY,
	SET_USER_HIGH_SCORE,
	SET_USER_SCORE
} from './User.constants';

const userReducer = (state = INITIAL_USER_STATE, action: UserActions) => {
	switch (action.type) {
		case SET_USER:
			return { ...state, ...action.payload };

		case SET_USER_AVATAR:
			return { ...state, avatar: action.payload };

		case SET_USER_SCORE:
			return { ...state, score: action.payload };

		case SET_USER_HIGH_SCORE:
			return { ...state, highScore: action.payload };

		case SET_USER_DIFFICULTY:
			return { ...state, difficulty: action.payload };

		default:
			return state;
	}
};

type UserActions =
	| {
			type: typeof SET_USER;
			payload: typeof INITIAL_USER_STATE;
		}
	| {
			type: typeof SET_USER_AVATAR;
			payload: string;
		}
	| {
			type: typeof SET_USER_SCORE;
			payload: number;
		}
	| {
			type: typeof SET_USER_HIGH_SCORE;
			payload: number;
		}
	| {
			type: typeof SET_USER_DIFFICULTY;
			payload: number;
		};

export default userReducer;
