import { FC, useState } from 'react';
import {
	BlueCandy,
	GreenCandy,
	RedCandy,
	YellowCandy,
	OrangeCandy,
	PurpleCandy
} from '../../Assets/Images';
import { GameContainer, Image } from './Gamepage.styled';

const candies = [
	BlueCandy,
	GreenCandy,
	YellowCandy,
	OrangeCandy,
	RedCandy,
	PurpleCandy
];

const Gamepage: FC<GamepageProps> = () => {
	const totalItems = 9 * 9;

	const [items, setStacks] = useState<{ [x: number]: null | string }>({
		...Array.from(
			{ length: totalItems },
			(_, i) => candies[Math.floor(Math.random() * 6 + 1) - 1]
		)
	});

	return (
		<GameContainer totalItems={totalItems}>
			<div className='left'></div>
			<div className='right'>
				<div className='body'>
					{Object.values(items).map((v, i) => (
						<div className='item-container' key={`item${i}`}>
							{v && <Image src={typeof v === 'string' ? v : ''} alt='' />}
						</div>
					))}
				</div>
			</div>
		</GameContainer>
	);
};

export default Gamepage;

interface GamepageProps {
	toggleStarted: (value: boolean) => void;
}
