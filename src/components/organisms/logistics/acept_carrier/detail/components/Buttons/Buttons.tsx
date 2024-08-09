"use client";
import React from "react";
import { Flex } from "antd";
import styles from "./buttons.module.scss";

interface ButtonsProps {
  isRightButtonActive?: boolean;
  isLeftButtonActive?: boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleReject: () => void;
}

export default function Buttons({
  isRightButtonActive,
  isLeftButtonActive,
  handleNext,
  handleBack,
  handleReject
}: ButtonsProps) {
  return (
    <Flex className={styles.wrapper}>
      <div className={styles.left}>
        <button
          className={styles.backButton}
          disabled={!isLeftButtonActive}
          style={{ cursor: isLeftButtonActive ? "pointer" : "not-allowed" }}
          onClick={handleBack}
        >
          <b>Atras</b>
        </button>
      </div>
      <Flex className={styles.right}>
        <button className={styles.deleteButton} onClick={() => handleReject()}>Rechazar</button>
        <button
          className={styles.nextButton}
          disabled={!isRightButtonActive}
          style={{
            backgroundColor: isRightButtonActive ? "#CBE71E" : "#DDDDDD",
            color: isRightButtonActive ? "black" : "white",
            cursor: isRightButtonActive ? "pointer" : "not-allowed"
          }}
          onClick={handleNext}
        >
          Siguiente
        </button>
      </Flex>
    </Flex>
  );
}
