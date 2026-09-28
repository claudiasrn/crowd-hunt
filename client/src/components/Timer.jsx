import { useState, useEffect } from "react";
import { formatTime } from "../utils/formatTime";

const TICK_MS = 100;

function Timer({ startTime, finalMs }) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (finalMs !== null) return;

		const id = setInterval(() => setNow(Date.now()), TICK_MS);
		return () => clearInterval(id);
	}, [finalMs]);

	const elapsed = finalMs ?? now - startTime;

	return <p aria-label="Elapsed time">{formatTime(elapsed)}</p>;
}

export default Timer;