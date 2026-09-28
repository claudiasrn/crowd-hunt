export function isHit(click, target, tolerance) {
	return (
		Math.abs(click.x - target.x) <= tolerance.x &&
		Math.abs(click.y - target.y) <= tolerance.y
	);
}