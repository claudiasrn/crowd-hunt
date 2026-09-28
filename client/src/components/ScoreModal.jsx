import { useState, useEffect, useRef } from "react";
import { submitName } from "../api";
import { formatTime } from "../utils/formatTime";

const NAME_MAX_LENGTH = 20;

function ScoreModal({ gameId, timeMs, onSubmitted }) {
	const dialogRef = useRef(null);
	const [name, setName] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		dialogRef.current.showModal();
	}, []);

	async function handleSubmit(e) {
		e.preventDefault();
		setPending(true);
		setError(null);

		try {
			const result = await submitName(gameId, name);
			onSubmitted(result.playerName);
		} catch (err) {
			setError(err.message);
		} finally {
			setPending(false);
		}
	}

	return (
		<dialog ref={dialogRef} onCancel={(e) => e.preventDefault()}>
			<h2>You found everyone!</h2>
			<p>Your time: {formatTime(timeMs)}</p>

			<form onSubmit={handleSubmit}>
				<label htmlFor="player-name">Name for the leaderboard</label>
				<input
					id="player-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					maxLength={NAME_MAX_LENGTH}
					required
					autoFocus
				/>
				<button type="submit" disabled={pending || !name.trim()}>
					{pending ? "Saving…" : "Save score"}
				</button>
			</form>

			{error && <p role="alert">{error}</p>}
		</dialog>
	);
}

export default ScoreModal;