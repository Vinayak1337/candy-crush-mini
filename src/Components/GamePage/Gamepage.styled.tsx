import styled from 'styled-components';

export const GameContainer = styled.div<{ totalItems: number }>`
	display: flex;
	height: 100vh;
	width: 100vw;
	overflow: hidden;

	.left {
		height: 100vh;
		width: 20%;
	}

	.right {
		box-sizing: border-box;
		border: 5px solid #476474;
		border-radius: 10px;
		width: 80%;
		transition: all 0.4s ease-in;

		.body {
			align-items: center;
			text-align: center;
			display: grid;
			grid-template-columns: repeat(9, 1fr);
			grid-template-rows: repeat(9, 10.97vh);
			width: 100%;
			background: rgba(71, 100, 116, 0.5);
			overflow: hidden;
			transition: all 0.4s ease-in;

			.item-container {
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				z-index: 1;
				width: 100%;
				height: 100%;
				transition: all 0.4s ease-in;

				&::before {
					content: '';
					z-index: 2;
					position: absolute;
					width: 10vw;
					height: 1px;
					text-align: center;
					top: 11vh;
					left: 0px;
					background: linear-gradient(
						to right,
						transparent,
						white,
						transparent
					);
					transition: all 0.4s ease-in;
				}

				&:nth-child(n + ${({ totalItems }) => totalItems - 9}) {
					&::before {
						height: 0px;
						transition: all 0.4s ease-in;
					}
				}

				&::after {
					content: '';
					z-index: 2;
					position: absolute;
					width: 10vw;
					height: 1px;
					text-align: center;
					top: 5vh;
					left: 4vw;
					background: linear-gradient(
						to left,
						transparent,
						rgba(255, 255, 255, 1),
						transparent
					);
					transform: rotate(90deg);
					transition: all 0.4s ease-in;
				}
			}
		}
	}

	@media (max-width: 960px) {
		img {
			height: 80%;
		}
	}

	@media (max-width: 760px) {
		img {
			height: 60%;
		}
	}

	@media (max-width: 560px) {
		img {
			height: 50%;
		}
	}

	@media (max-width: 460px) {
		img {
			height: 40%;
		}
	}

	@media (max-width: 400px) {
		flex-direction: column;

		.left {
			height: 20%;
			width: 100vw;
		}

		.right {
			height: 80%;
			width: 100vw;

			.body {
				grid-template-rows: repeat(9, 8.8vh);
				height: fit-content;
				.item-container {
					height: fit-content;

					&::before {
						top: 6vh;
					}

					&::after {
						top: 2vh;
						left: 6.5vw;
					}
				}
			}
		}
	}

	@media (max-width: 380px) {
		img {
			height: 40%;
		}
	}
`;

export const Image = styled.img`
	width: 100%;
	height: 100%;
	background: none;
	transition: slide 1s ease-in;
	animation: slide 0.4s;
	position: relative;
	left: 2px;

	@keyframes slide {
		0% {
			top: -100vh;
		}
		100% {
			top: 0vh;
		}
	}
`;
