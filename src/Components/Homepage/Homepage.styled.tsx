import styled from 'styled-components';

export const HomepageContainer = styled.div`
	text-align: center;
	display: flex;
	justify-content: space-between;
	width: 100%;
	height: 100%;

	.left {
		display: flex;
		align-items: flex-end;
		height: 100%;

		.settings {
			position: relative;
			margin-bottom: 2rem;
			margin-left: 0.5rem;
			font-size: 20px;
			font-family: Candice;
			border-radius: 100%;
			width: 3.2rem;
			height: 3.2rem;
			background-size: cover;
			background: #dc1476;
			border: 3px solid #db096c;
			border-bottom: 3px solid #ee449a;
			z-index: 1;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				border-radius: 50%;
				width: 100px;
				height: 50%;
				left: -30px;
				top: 0px;
				transform: rotate(-45deg);
				background: linear-gradient(
					to bottom,
					rgba(255, 255, 255, 0.8),
					rgba(255, 255, 255, 0.2)
				);
			}

			&::after {
				content: '';
				position: absolute;
				border-radius: 100%;
				width: 4rem;
				height: 4rem;
				left: -5px;
				top: -5px;
				background: rgba(255, 255, 255, 0.2);
			}

			.shine {
				content: '';
				position: absolute;
				border-radius: 50%;
				transform: rotate(-40deg);
				width: 30px;
				height: 7px;
				top: -1px;
				left: -3px;
				background: linear-gradient(
					to right,
					rgba(255, 255, 255, 1),
					transparent
				);

				&::before {
					content: '';
					position: absolute;
					border-radius: 50%;
					transform: rotate(-40deg);
					width: 7px;
					height: 3px;
					top: 10px;
					left: -10px;
					background: rgba(255, 255, 255, 0.8);
				}
			}

			.icon {
				position: relative;
				top: 3px;
				height: 34px;
				width: 34px;
				fill: #fcafd1;
			}
		}
	}

	.middle {
		display: flex;
		gap: 10px;
		flex-direction: column;
		justify-content: flex-end;
		margin-bottom: 10rem;

		button {
			color: whitesmoke;
			text-transform: capitalize;
			border-radius: 2rem;
			font-size: 1.5rem;
			font-family: Candice;
			width: 15rem;
			height: 4rem;
		}

		.play {
			position: relative;
			border: 5px solid #f03f75;
			border-bottom: 5px solid #ff47a1;
			z-index: 1;
			overflow: hidden;
			background: linear-gradient(to bottom, #fa4896, #e40363);
			font-size: 2.5rem;
			box-shadow: 2px 2px 10px rgb(0, 0, 0);

			&::before {
				content: '';
				position: absolute;
				left: 5%;
				height: 7px;
				width: 17px;
				border-radius: 100%;
				transform: rotate(-20deg);
				background: linear-gradient(
					to right,
					rgba(255, 255, 255, 1),
					rgba(255, 255, 255, 0.4)
				);
			}

			&::after {
				content: '';
				position: absolute;
				border-radius: none;
				z-index: 2;
				width: 110%;
				height: 50%;
				top: 0;
				left: -10px;
				right: 0;
				bottom: 0;
				background: rgba(255, 255, 255, 0.3);
			}
		}

		.load {
			position: relative;
			border: 5px solid #0096ff;
			border-bottom: 5px solid #04abf9;
			z-index: 1;
			overflow: hidden;
			background: linear-gradient(to bottom, #00aef1, #006ffe);
			box-shadow: 2px 2px 10px rgb(0, 0, 0);

			&::before {
				content: '';
				position: absolute;
				left: 10px;
				top: 4px;
				height: 7px;
				width: 17px;
				border-radius: 100%;
				transform: rotate(-20deg);
				background: linear-gradient(
					to right,
					rgba(255, 255, 255, 1),
					rgba(255, 255, 255, 0.4)
				);
			}

			&::after {
				content: '';
				position: absolute;
				border-radius: none;
				z-index: 2;
				width: 110%;
				height: 50%;
				top: 0;
				left: -10px;
				right: 0;
				bottom: 0;
				background: rgba(255, 255, 255, 0.3);
			}
		}
	}
`;
