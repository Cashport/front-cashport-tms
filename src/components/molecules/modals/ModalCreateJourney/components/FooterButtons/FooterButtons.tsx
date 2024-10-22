import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Flex } from "antd";
import styles from "./FooterButtons.module.scss";

interface FooterButtonsProps {
  backTitle: string;
  nextTitle: string;
  handleNext: () => void; // Función que se ejecuta al presionar el botón "Siguiente"
  handleBack: () => void; // Función que se ejecuta al presionar el botón "Atrás"
  nextDisabled?: boolean; // Deshabilitar el botón "Siguiente"
  backDisabled?: boolean; // Deshabilitar el botón "Atrás"
  isSubmitting?: boolean; // Mostrar un estado de carga en los botones
}

export const FooterButtons = ({
  backTitle,
  nextTitle,
  handleNext,
  handleBack,
  nextDisabled = false, // Valor por defecto
  backDisabled = false, // Valor por defecto
  isSubmitting = false // Valor por defecto
}: FooterButtonsProps) => {
  return (
    <Flex gap={24} justify="center">
      <PrincipalButton
        type="default"
        fullWidth
        onClick={handleBack}
        disabled={backDisabled || isSubmitting}
      >
        {backTitle}
      </PrincipalButton>

      <PrincipalButton
        fullWidth
        disabled={nextDisabled || isSubmitting}
        loading={isSubmitting}
        onClick={handleNext}
      >
        {nextTitle}
      </PrincipalButton>
    </Flex>
  );
};
