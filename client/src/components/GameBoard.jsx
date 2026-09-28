import { useState, useEffect, useRef } from "react";
import { getRelativeCoords } from "../utils/coords";
import { startGame, submitGuess } from "../api";
import TargetBox from "./TargetBox";
import CharacterMenu from "./CharacterMenu";
import Marker from "./Marker";
import styles from "./GameBoard.module.css";

// Temporary until the image picker exists.
const IMAGE_ID = 1;
const FEEDBACK_MS = 2000;

function GameBoard() {
	const [game, setGame] = useState(null);
	const [error, setError] = useState(null);
	const [target, setTarget] = useState(null);
	const [markers, setMarkers] = useState([]);
	const [feedback, setFeedback] = useState(null);
	const [pending, setPending] = useState(false);
	const [finishedTime, setFinishedTime] = useState(null);
	const boardRef = useRef(null);
	const hasStarted = useRef(false);
	const feedbackTimeout = useRef(null);

	useEffect(() => {
		if (hasStarted.current) return;
		hasStarted.current = true;

		startGame(IMAGE_ID)
			.then(setGame)
			.catch((err) => setError(err.message));
	}, []);

	useEffect(() => {
		return () => clearTimeout(feedbackTimeout.current);
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

	function showFeedback(message) {
		clearTimeout(feedbackTimeout.current);
		setFeedback(message);
		feedbackTimeout.current = setTimeout(() => setFeedback(null), FEEDBACK_MS);
	}

	function handleImageClick(e) {
		if (pending || finishedTime !== null) return;

		if (target) {
			setTarget(null);
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const coords = getRelativeCoords(e.clientX, e.clientY, rect);
		setTarget(coords);
	}

	async function handleSelect(characterId) {
		const { x, y } = target;
		setTarget(null);
		setPending(true);

		try {
			const result = await submitGuess(game.gameId, characterId, x, y);

			if (!result.correct) {
				showFeedback("Not there, keep looking!");
				return;
			}

			setMarkers((prev) => [...prev, { id: characterId, ...result.location }]);
			showFeedback("Found one!");

			if (result.finished) {
				setFinishedTime(result.timeMs);
			}
		} catch (err) {
			showFeedback(err.message);
		} finally {
			setPending(false);
		}
	}

	if (error) return <p>Couldn't start the game: {error}</p>;
	if (!game) return <p>Loading…</p>;

	const foundIds = new Set(markers.map((m) => m.id));
	const remainingTargets = game.targets.filter((t) => !foundIds.has(t.id));

	return (
		<>
			{feedback && <p role="status">{feedback}</p>}
			{finishedTime !== null && <p>Finished in {(finishedTime / 1000).toFixed(1)}s</p>}

			<div className={styles.board} ref={boardRef}>
				<img
					className={styles.image}
					src={game.image.url}
					alt="A large crowd of spectators at a race"
					onClick={handleImageClick}
				/>
				{markers.map((m) => (
					<Marker key={m.id} x={m.x} y={m.y} />
				))}
				{target && (
					<>
						<TargetBox x={target.x} y={target.y} />
						<CharacterMenu
							x={target.x}
							y={target.y}
							targets={remainingTargets}
							onSelect={handleSelect}
						/>
					</>
				)}
			</div>
		</>
	);
}

export default GameBoard;
