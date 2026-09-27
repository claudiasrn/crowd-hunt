import { getRelativeCoords } from "../utils/coords";

function GameBoard() {
	function handleImageClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const coords = getRelativeCoords(e.clientX, e.clientY, rect);
		console.log(coords);
	}

	return (
		<div>
			<img
				src="/images/front-row.jpg"
				alt="A large crowd of spectators at a race"
				onClick={handleImageClick}
			/>
		</div>
	);
}

export default GameBoard;