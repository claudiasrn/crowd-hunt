// src/components/CharacterMenu.jsx
import styles from "./CharacterMenu.module.css";

function CharacterMenu({ x, y, targets, onSelect }) {
	return (
		<ul
			className={styles.menu}
			style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
		>
			{targets.map((t) => (
				<li key={t.id}>
					<button
						type="button"
						className={styles.option}
						onClick={() => onSelect(t.id)}
					>
						<img src={t.thumbnail} alt={t.name} className={styles.thumb} />
					</button>
				</li>
			))}
		</ul>
	);
}

export default CharacterMenu;