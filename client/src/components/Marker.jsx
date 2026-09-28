import styles from "./Marker.module.css";

function Marker({ x, y }) {
	return (
		<div
			data-testid="marker"
			className={styles.marker}
			style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
		/>
	);
}

export default Marker;