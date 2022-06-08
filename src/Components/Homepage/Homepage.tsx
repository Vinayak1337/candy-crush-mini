import { FC } from 'react';
import { SettingsIcon } from '../../Assets/Images';
import { HomepageContainer } from './Homepage.styled';

const Homepage: FC<HomepageProps> = ({ toggleStarted }) => {
	// const [state, setState] = useState({
	// 	openSettings: false,
	// 	loaded: false
	// });

	// const changeState = (newState: Partial<typeof state>) =>
	// 	setState(prevState => ({ ...prevState, ...newState }));

	return (
		<HomepageContainer>
			<div className='left'>
				<button
					className='settings'
					onClick={() => alert('Under construction')}>
					<span className='shine' />
					<SettingsIcon className='icon' />
				</button>
			</div>
			<div className='middle'>
				<button className='play' onClick={toggleStarted.bind(null, true)}>
					Play!
				</button>
				<button className='load' onClick={() => alert('Under construction')}>
					Load my Progress
				</button>
			</div>
			<div className='right'></div>
		</HomepageContainer>
	);
};

export default Homepage;

interface HomepageProps {
	toggleStarted: (value: boolean) => void;
}
