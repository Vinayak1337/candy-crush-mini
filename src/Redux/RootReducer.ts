import { combineReducers } from 'redux';
import persistReducer from 'redux-persist/es/persistReducer';
import storage from 'redux-persist/lib/storage';
import { windowReducer } from './Window/Window.reducer';

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['userReducer']
};

export const rootReducer = combineReducers({
	windowReducer,
});

export const persistCombined = persistReducer(persistConfig, rootReducer);
