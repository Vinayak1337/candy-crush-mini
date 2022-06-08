import {
	INITIAL_USER_STATE,
	SET_USER,
	SET_USER_AVATAR,
	SET_USER_DIFFICULTY,
	SET_USER_HIGH_SCORE,
	SET_USER_SCORE
} from './User.constants';

export const setUser = (user: typeof INITIAL_USER_STATE) => ({
		type: SET_USER,
		payload: user
	}),
	setUserAvatar = (avatar: string) => ({
		type: SET_USER_AVATAR,
		payload: avatar
	}),
	setUserScore = (score: number) => ({
		type: SET_USER_SCORE,
		payload: score
	}),
	setUserHighScore = (score: number) => ({
		type: SET_USER_HIGH_SCORE,
		payload: score
	}),
	setUserDifficulty = (difficulty: number) => ({
		type: SET_USER_DIFFICULTY,
		payload: difficulty
	});
