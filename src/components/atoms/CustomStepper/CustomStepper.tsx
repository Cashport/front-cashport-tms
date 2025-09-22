import { Flex } from "antd";
import styles from "./Stepper.module.scss";

const COLORS = {
  WHITE: "#FFFFFF",
  GREEN: "#CBE71E",
  BLACK: "#141414",
  DARKGREY: "#969696",
  GREY: "#DDDDDD"
};

const STEPSTYLES = {
  CURRENT: {
    bulletBg: COLORS.BLACK,
    bulletText: COLORS.WHITE,
    title: COLORS.BLACK,
    fontWeight: "bold"
  },
  COMPLETED: {
    bulletBg: COLORS.GREEN,
    bulletText: COLORS.BLACK,
    title: COLORS.BLACK,
    fontWeight: "normal"
  },
  NEXTSTEP: {
    bulletBg: COLORS.DARKGREY,
    bulletText: COLORS.WHITE,
    title: COLORS.DARKGREY,
    fontWeight: "normal"
  },
  DISABLED: {
    bulletBg: COLORS.GREY,
    bulletText: COLORS.WHITE,
    title: COLORS.GREY,
    fontWeight: "normal"
  }
};

interface Step {
  title: string;
  disabled?: boolean;
}
interface CustomStepperProps {
  steps: Step[];
  currentStepIndex: number;
}

export const CustomStepper = ({ steps, currentStepIndex }: CustomStepperProps) => {
  const getStepStyle = (step: Step, stepIndex: number, currentIndex: number) => {
    if (step.disabled) return STEPSTYLES.DISABLED;
    if (currentIndex === stepIndex) return STEPSTYLES.CURRENT;
    if (currentIndex > stepIndex) return STEPSTYLES.COMPLETED;
    else return STEPSTYLES.NEXTSTEP;
  };

  return (
    <Flex className={styles.stepper}>
      <Flex justify="space-evenly">
        {steps.map((step, stepIndex) => {
          const currentStepStyle = getStepStyle(step, stepIndex, currentStepIndex);
          return (
            <Flex key={`step-${step.title}-${stepIndex}`} className={styles.step}>
              <div
                className={styles.bullet}
                style={{
                  background: currentStepStyle.bulletBg,
                  color: currentStepStyle.bulletText
                }}
              >
                {stepIndex + 1}
              </div>
              <span
                className={styles.stepName}
                style={{ fontWeight: currentStepStyle.fontWeight, color: currentStepStyle.title }}
              >
                {step.title}
              </span>
              {stepIndex < steps.length - 1 && <div className={styles.divider} />}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
