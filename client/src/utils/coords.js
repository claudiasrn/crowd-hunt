export function getRelativeCoords(clientX, clientY, rect) {
	const x = (clientX - rect.left) / rect.width;
	const y = (clientY - rect.top) / rect.height;
	return { x, y };
}