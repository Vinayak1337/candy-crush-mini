import { useEffect, useState } from 'react';

export const useLogger = (...values: any[]) => {
	useEffect(
		() => {
			console.log(...values);
		},
		[values]
	);
};

const getFromSession = (key: string) =>
	JSON.parse(sessionStorage.getItem(key) || '');

const setToSession = (key: string, value: string) =>
	sessionStorage.setItem(key, value);

export const useSession = (value: any, key: string) => {
	const [state, setStateA] = useState<typeof value>(getFromSession(key) || value);

	const setState = (newValue: Object) => {
		setStateA((prevState: Object) => {
			const newState = { ...prevState, ...newValue };
			setToSession(key, JSON.stringify(newValue));

			return newState;
		});
	};

	return [state, setState];
};
