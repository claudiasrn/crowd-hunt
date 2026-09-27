import { useState, useEffect, useRef } from "react";
import { getRelativeCoords } from "../utils/coords";
import TargetBox from "./TargetBox";
import CharacterMenu from "./CharacterMenu";
import styles from "./GameBoard.module.css";

// Temporary, will come from the server later
const TARGETS = [
	{ id: 1, name: "yellow-cap", thumbnail: "/images/targets/yellow-cap.jpg" },
	{ id: 2, name: "big-curls", thumbnail: "/images/targets/big-curls.jpg" },
	{ id: 3, name: "orange-brim", thumbnail: "/images/targets/orange-brim.jpg" },
];

function GameBoard() {
	const [target, setTarget] = useState(null);
	const boardRef = useRef(null);

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
		console.log({ characterId, x: target.x, y: target.y });
		setTarget(null);
	}

	return (
		<div className={styles.board} ref={boardRef}>
			<img
				className={styles.image}
				src="/images/Front-row.jpg"
				alt="A large crowd of spectators at a race"
				onClick={handleImageClick}
			/>
			{target && (
				<>
					<TargetBox x={target.x} y={target.y} />
					<CharacterMenu
						x={target.x}
						y={target.y}
						targets={TARGETS}
						onSelect={handleSelect}
					/>
				</>
			)}
		</div>
	);
}

export default GameBoard;