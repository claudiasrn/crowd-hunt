import { useState } from "react";
import { getRelativeCoords } from "../utils/coords";
import TargetBox from "./TargetBox";
import styles from "./GameBoard.module.css";

function GameBoard() {
	const [target, setTarget] = useState(null);

	function handleImageClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const coords = getRelativeCoords(e.clientX, e.clientY, rect);
		setTarget(coords);
	}

	return (
		<div className={styles.board}>
			<img
				className={styles.image}
				src="/images/Front-row.jpg"
				alt="A large crowd of spectators at a race"
				onClick={handleImageClick}
			/>
			{target && <TargetBox x={target.x} y={target.y} />}
		</div>
	);
}

export default GameBoard;