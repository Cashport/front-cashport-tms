import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";

import styles from "./restartPassword.module.scss";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

interface IAuthLogin {
  email: string;
}

const schema = yup.object().shape({
  email: yup.string().email().required()
});

interface RestartFormProps {
  setResetPassword: Dispatch<SetStateAction<boolean>>;
}
export const RestartPassword = ({ setResetPassword }: RestartFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>();
  const {
    control,
    handleSubmit,

    formState: { isValid }
  } = useForm<IAuthLogin>({
    resolver: yupResolver(schema)
  });

  const onSubmitHandler = async ({ email }: IAuthLogin) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setEmail(email);
    }, 1000);
  };

  const handleUnderstood = () => {
    setResetPassword(false);
  };

  return (
    <div className={styles.restartContainer}>
      {email ? (
        <p className={styles.sentText}>
          Hemos enviado un correo a <strong>{email}</strong>, sigue las instrucciones para
          restablecer tu contraseña
        </p>
      ) : (
        <>
          <h4 className={styles.restartContainer__title}>Restablece tu contraseña</h4>
          <p>Ingresa tu correo electrónico para restablecer tu contraseña</p>

          <Flex vertical gap={"1.5rem"} className={styles.restartContent}>
            <div>
              <p className={styles.restartContainer__inputTitle}>Correo electrónico</p>
              <InputForm
                customStyle={{ with: "100%" }}
                placeholder="Ingresar usuario"
                hiddenTitle
                control={control}
                nameInput="email"
                typeInput="email"
                validationRules={{ required: "Email es obligatorio" }}
              />
            </div>
          </Flex>
        </>
      )}

      <PrincipalButton
        disabled={!isValid}
        loading={isLoading}
        onClick={email ? handleUnderstood : handleSubmit(onSubmitHandler)}
      >
        {email ? "Entendido" : "Enviar"}
      </PrincipalButton>
    </div>
  );
};
