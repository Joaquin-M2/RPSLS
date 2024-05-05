import styles from "./PlayerColumnCard.module.scss";

type PlayerColumnCardProps = {
  title: string;
  children: JSX.Element | JSX.Element[];
};

function PlayerColumnCard({ title, children }: PlayerColumnCardProps) {
  return (
    <div className={styles.playerColumn}>
      <h3 className={styles.playerTitle}>{title}</h3>
      {children}
    </div>
  );
}

export default PlayerColumnCard;
