const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
	const res = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	const data = await res.json().catch(() => null);

	if (!res.ok) {
		const message = data?.message ?? data?.errors?.[0]?.msg ?? "Request failed";
		throw new Error(message);
	}

	return data;
}

export function startGame(imageId) {
	return request("/games", {
		method: "POST",
		body: JSON.stringify({ imageId }),
	});
}

export function submitGuess(gameId, characterId, x, y) {
	return request(`/games/${gameId}/guesses`, {
		method: "POST",
		body: JSON.stringify({ characterId, x, y }),
	});
}

export function submitName(gameId, name) {
	return request(`/games/${gameId}`, {
		method: "PATCH",
		body: JSON.stringify({ name }),
	});
}

export function getScores(imageId) {
	return request(`/images/${imageId}/scores`);
}