import React from "react";
import styles from "./OccupationPercentageBar.module.scss";

interface OccupationPercentageBarProps {
  percentage?: number;
}

export const OccupationPercentageBar: React.FC<OccupationPercentageBarProps> = ({ percentage }) => {
  if (!percentage || percentage === null) return null;

  const totalBars = 10;
  const filledBars = Math.ceil((percentage / 100) * totalBars);

  return (
    <div className={styles.container}>
      <div className={styles.barsContainer}>
        {Array.from({ length: totalBars }).map((_, index) => (
          <div
            key={index}
            className={`${styles.bar} ${index < filledBars ? styles.filled : styles.empty}`}
          />
        ))}
      </div>
      <span className={styles.percentage}>{percentage}%</span>
    </div>
  );
};
