import { useState } from "react";
import GameBoard from "./components/GameBoard";

function App() {
	const [round, setRound] = useState(0);

	return (
		<GameBoard key={round} onPlayAgain={() => setRound((r) => r + 1)} />
	);
}

export default App;
