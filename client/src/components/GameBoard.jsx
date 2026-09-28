import { useState, useEffect, useRef } from "react";
import { getRelativeCoords } from "../utils/coords";
import { startGame } from "../api";
import TargetBox from "./TargetBox";
import CharacterMenu from "./CharacterMenu";
import styles from "./GameBoard.module.css";

// Temporary until the image picker exists.
const IMAGE_ID = 1;

function GameBoard() {
	const [game, setGame] = useState(null);
	const [error, setError] = useState(null);
	const [target, setTarget] = useState(null);
	const boardRef = useRef(null);
	const hasStarted = useRef(false);

	useEffect(() => {
		if (hasStarted.current) return;
		hasStarted.current = true;

		startGame(IMAGE_ID)
			.then(setGame)
			.catch((err) => setError(err.message));
	}, []);

	useEffect(() => {
		if (!target) return;

		function handleDocumentClick(e) {
			if (!boardRef.current.contains(e.target)) {
				setTarget(null);
			}
		}

		function handleKeyDown(e) {
			if (e.key === "Escape") {
				setTarget(null);
			}
		}

		document.addEventListener("click", handleDocumentClick);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("click", handleDocumentClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [target]);

	function handleImageClick(e) {
		if (target) {
			setTarget(null);
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const coords = getRelativeCoords(e.clientX, e.clientY, rect);
		setTarget(coords);
	}

	function handleSelect(characterId) {
		console.log({ gameId: game.gameId, characterId, x: target.x, y: target.y });
		setTarget(null);
	}

	if (error) return <p>Couldn't start the game: {error}</p>;
	if (!game) return <p>Loading…</p>;

	return (
		<div className={styles.board} ref={boardRef}>
			<img
				className={styles.image}
				src={game.image.url}
				alt="A large crowd of spectators at a race"
				onClick={handleImageClick}
			/>
			{target && (
				<>
					<TargetBox x={target.x} y={target.y} />
					<CharacterMenu
						x={target.x}
						y={target.y}
						targets={game.targets}
						onSelect={handleSelect}
					/>
				</>
			)}
		</div>
	);
}

export default GameBoard;
