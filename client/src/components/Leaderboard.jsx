import { useState, useEffect } from "react";
import { getScores } from "../api";
import { formatTime } from "../utils/formatTime";

function Leaderboard({ imageId, currentGameId }) {
	const [scores, setScores] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		getScores(imageId)
			.then((data) => setScores(data.scores))
			.catch((err) => setError(err.message));
	}, [imageId]);

	if (error) return <p>Couldn't load the leaderboard: {error}</p>;
	if (!scores) return <p>Loading leaderboard…</p>;
	if (scores.length === 0) return <p>No scores yet.</p>;

	return (
		<section aria-labelledby="leaderboard-title">
			<h2 id="leaderboard-title">Leaderboard</h2>
			<ol>
				{scores.map((s) => (
					<li
						key={s.id}
						aria-current={s.id === currentGameId ? "true" : undefined}
					>
						{s.playerName}: {formatTime(s.timeMs)}
						{s.id === currentGameId && " (you)"}
					</li>
				))}
			</ol>
		</section>
	);
}

export default Leaderboard;