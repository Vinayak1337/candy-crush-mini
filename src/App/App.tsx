import { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import {
	CandyCrushLandscape,
	CandyCrushPortrait,
	CandyCrushBg
} from '../Assets/Images';
import Gamepage from '../Components/GamePage/Gamepage';
import Homepage from '../Components/Homepage/Homepage';
import {
	setWindowPageOffset,
	setWindowSize,
	setWindowTarget
} from '../Redux/Window/Window.actions';

const MainBody = styled.div<{ src: string }>`
	height: 100vh;
	width: 100vw;
	transition: all 0.2s ease;
	background-image: url(${({ src }) => src});
	background-size: cover;
	background-repeat: no-repeat;
	background-position: 30%;
	height: 100vh;
	width: 100vw;

	@media (max-width: 600px) {
		background-size: none;
		background-position: 0%;
	}
`;

const App: FC<AppProps> = ({ setSize, setOffset, setTarget, width }) => {
	const [started, setStarted] = useState(
		JSON.parse(sessionStorage.getItem('started') || 'false')
	);

	const toggleStarted = (value: Boolean) => {
		sessionStorage.setItem('app', String(value));
		setStarted(value);
	};

	useEffect(() => {
		window.onresize = function () {
			setSize({
				width: window.innerWidth,
				height: window.innerHeight
			});
		};

		window.onclick = function (event) {
			setTarget(event.target);
		};

		window.onscroll = function () {
			setOffset({
				pageXOffset: window.pageXOffset,
				pageYOffset: window.pageYOffset
			});
		};
	}, [setOffset, setSize, setTarget]);

	useEffect(() => {
		window.addEventListener('mousedown', () => console.log('mouse down'));
		window.addEventListener('mouseup', () => console.log('mouse up'));
	}, []);

	return (
		<MainBody
			src={
				started
					? CandyCrushBg
					: width > 600
					? CandyCrushLandscape
					: CandyCrushPortrait
			}>
			{started ? (
				<Gamepage toggleStarted={toggleStarted} />
			) : (
				<Homepage toggleStarted={toggleStarted} />
			)}
		</MainBody>
	);
};

const mapStateToProps = (state: RootState) => ({
	width: state.windowReducer.width
});

const stateDispatchToProps = (dispatch: Dispatch) => ({
	setSize: (size: WindowSize) => dispatch(setWindowSize(size)),
	setOffset: (offset: WindowPageOffset) =>
		dispatch(setWindowPageOffset(offset)),
	setTarget: (target: EventTarget | null) => dispatch(setWindowTarget(target))
});

export default connect(mapStateToProps, stateDispatchToProps)(App);

interface AppProps {
	setSize: (size: WindowSize) => void;
	setOffset: (pageOffset: WindowPageOffset) => void;
	setTarget: (target: EventTarget | null) => void;
	width: number;
}
