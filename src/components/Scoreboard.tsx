import styles from "./Scoreboard.module.scss";

type ScoreboardProps = {
  totalBet: number;
};

export default function Scoreboard({ totalBet }: ScoreboardProps) {
  return (
    <div className={styles.totalBetIndicatorWrapper}>
      <div className={styles.totalBetIndicator}>
        Total Amount Bet: {totalBet} Wei
      </div>
      <a href="https://eth-converter.com/" target="_blank">
        ETH - Gwei - Wei converter
      </a>
    </div>
  );
}
