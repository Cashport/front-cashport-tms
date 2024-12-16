import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, Tooltip, notification } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { getAuth } from "../../../../../firebase-utils";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { openNotification } from "@/components/atoms/Notification/Notification";

import "./loginform.scss";
import Link from "next/link";

interface IAuthLogin {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).max(32).required()
});

interface LoginFormProps {
  setResetPassword: Dispatch<SetStateAction<boolean>>;
}
export const LoginForm = ({ setResetPassword }: LoginFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid }
  } = useForm<IAuthLogin>({
    resolver: yupResolver(schema)
  });
  const [api, contextHolder] = notification.useNotification();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async ({ email, password }: IAuthLogin) => {
    setIsLoading(true);

    await getAuth(email.trim(), password, router, false, openNotification, api);
    setIsLoading(false);
    reset();
  };
  const handleForgotPassword = () => {
    setResetPassword(true);
  };

  return (
    <form className="loginForm" onSubmit={handleSubmit(onSubmitHandler)}>
      {contextHolder}
      <h4 className="loginForm__title">Inicia sesión</h4>

      <Flex vertical gap={"1.5rem"} className="loginForm__content">
        <div>
          <p className="loginForm__inputTitle">Usuario</p>
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
        <div>
          <p className="loginForm__inputTitle">Contraseña</p>
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                size="large"
                type={showPassword ? "text" : "password"}
                className="inputPassword"
                placeholder="Contrasena"
                variant="borderless"
                required
                autoComplete="current-password"
                suffix={
                  <Tooltip title={showPassword ? "Hidden Password" : "Show Password"}>
                    {!showPassword ? (
                      <Eye onClick={() => setShowPassword(true)} className={"iconEyePassword"} />
                    ) : (
                      <EyeClosed
                        onClick={() => setShowPassword(false)}
                        className={"iconEyePassword"}
                      />
                    )}
                  </Tooltip>
                }
                {...field}
              />
            )}
          />
        </div>
        <p onClick={handleForgotPassword} className="forgotPassword">
          Olvidé mi contraseña
        </p>
        <p className="loginForm__inputTitleReg">
          Al continuar aceptas nuestros 
          <Link
            className="loginForm__link"
            href={
              "https://cashport-tms.s3.us-east-2.amazonaws.com/T%26C+Profitline+-+Cashport+Logistics.htm"
            }
            target="_blank"
          >
            Términos y condiciones
          </Link>
           y {" "}
          <Link
            className="loginForm__link"
            href={"https://profitline.com.co/politicas-proteccion-datos-personales-habeas-data"}
            target="_blank"
          >
            Política de tratamiento de datos
          </Link>
        </p>
      </Flex>
      <PrincipalButton disabled={!isValid} loading={isLoading} htmlType="submit">
        {isLoading ? "Cargando..." : "Iniciar sesión"}
      </PrincipalButton>
    </form>
  );
};
