import { CaretRight } from "@phosphor-icons/react";
import styles from "./buttonGenerateAction.module.scss";

type ButtonGenerateActionProps = {
  icon: React.ReactElement;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  hideArrow?: boolean;
};
export const ButtonGenerateAction: React.FC<ButtonGenerateActionProps> = ({
  icon,
  title,
  onClick,
  disabled = false,
  hideArrow = false
}) => {
  return (
    <button className={styles.actionButton} onClick={onClick} disabled={disabled}>
      {icon}
      <p className={styles.actionButton__text}>{title}</p>
      {!hideArrow && <CaretRight className={styles.actionButton__caretRight} size={"1.1rem"} />}
    </button>
  );
};
