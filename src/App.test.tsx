import { render, screen } from '@testing-library/react';
import Gamepage from './Components/GamePage/Gamepage';
import { WIDTH } from './Assets/board';

// Smoke test for the fully wired game: the Gamepage should mount, render the
// HUD and a complete WIDTH*WIDTH board of candy cells from the logic layer.
test('renders the game board and HUD', () => {
	render(<Gamepage toggleStarted={() => undefined} />);

	expect(screen.getByText(/Candy Crush Mini/i)).toBeInTheDocument();
	expect(screen.getByText('Score')).toBeInTheDocument();
	expect(screen.getByText('Target')).toBeInTheDocument();
	expect(screen.getByText('Moves left')).toBeInTheDocument();

	// Every cell is a button labelled with its candy (no empty cells on a
	// freshly generated, gravity-filled board).
	const candies = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
	const cells = screen
		.getAllByRole('button')
		.filter(b => candies.includes(b.getAttribute('aria-label') || ''));
	expect(cells).toHaveLength(WIDTH * WIDTH);
});
