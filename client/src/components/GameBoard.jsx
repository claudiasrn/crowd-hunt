import { getRelativeCoords } from "../utils/coords";

function GameBoard() {
	function handleImageClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const coords = getRelativeCoords(e.clientX, e.clientY, rect);
		console.log(`x: ${coords.x.toFixed(4)}, y: ${coords.y.toFixed(4)}`);
	}

	return (
		<div>
			<img
				src="/images/Under-the-lights.jpg"
				alt="A large crowd of spectators at a race"
				onClick={handleImageClick}
			/>
		</div>
	);
}

export default GameBoard;