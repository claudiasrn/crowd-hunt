import styles from "./TargetBox.module.css";

function TargetBox({ x, y }) {
	return (
		<div
			data-testid="target-box"
			className={styles.box}
			style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
		/>
	);
}

export default TargetBox;
