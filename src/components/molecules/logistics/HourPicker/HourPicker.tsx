import React, { useEffect, useState } from "react";
import styles from "./HourPicker.module.scss";
import { CaretDown, CaretUp } from "phosphor-react";

type CustomTimeSelectorProps = {
  initialValue?: number;
  maxValue?: number;
  onTimeChange?: (value: number) => void;
};

const CustomTimeSelector: React.FC<CustomTimeSelectorProps> = ({
  initialValue = 1,
  maxValue = 50,
  onTimeChange
}) => {
  const [time, setTime] = useState<number>(initialValue);

  useEffect(() => {
    setTime(initialValue);
    return () => {
      setTime(initialValue);
    };
  }, [initialValue]);

  const handleIncrement = () => {
    setTime((prev) => {
      const newValue = prev < maxValue ? prev + 1 : 1;
      onTimeChange && onTimeChange(newValue);
      return newValue;
    });
  };

  const handleDecrement = () => {
    setTime((prev) => {
      const newValue = prev > 1 ? prev - 1 : maxValue;
      onTimeChange && onTimeChange(newValue);
      return newValue;
    });
  };

  return (
    <div className={styles.customTimeSelector}>
      <CaretUp size={16} weight="thin" onClick={handleIncrement} />
      <input
        className={styles.input}
        type="text"
        value={time.toString().padStart(2, "0")}
        readOnly
      />
      <CaretDown size={16} weight="thin" onClick={handleDecrement} />
    </div>
  );
};

export default CustomTimeSelector;
