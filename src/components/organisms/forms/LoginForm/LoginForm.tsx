import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, Tooltip, notification } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { signInWithPolicyCheck, continueLoginAfterAuth } from "../../../../../firebase-utils";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { openNotification } from "@/components/atoms/Notification/Notification";
import { sendLoginOtp, verifyLoginOtp } from "@/services/auth/authPolicy";

import "./loginform.scss";
import Link from "next/link";

interface IAuthLogin {
  email: string;
  password?: string;
  otp?: string;
}

// La contraseña deja de ser obligatoria una vez enviado el código: en ese paso
// el usuario ya está autenticado en Firebase y el formulario solo pide el OTP.
const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup
    .string()
    .min(5)
    .max(32)
    .when("$isCodeSent", {
      is: true,
      then: (rule) => rule.notRequired(),
      otherwise: (rule) => rule.required()
    }),
  otp: yup
    .string()
    .length(6)
    .matches(/^\d{6}$/)
    .when("$isCodeSent", {
      is: true,
      then: (rule) => rule.required(),
      otherwise: (rule) => rule.notRequired()
    })
});

const RESEND_COOLDOWN_SECONDS = 60;

interface LoginFormProps {
  setResetPassword: Dispatch<SetStateAction<boolean>>;
  // Se dispara cuando la política de expiración exige una contraseña nueva
  // antes de completar el login. El correo precarga la pantalla de cambio que
  // monta el padre (Login.tsx).
  // eslint-disable-next-line no-unused-vars
  onExpiredPassword?: (email: string) => void;
  // Lo fija el padre cuando ya completó el sign-in y el cambio de contraseña
  // (ambos fuera de este componente) y todavía falta el OTP: salta directo a la
  // pantalla de código en vez de volver a pedir credenciales, porque la sesión
  // de Firebase ya es válida.
  initialOtpEmail?: string;
}

export const LoginForm = ({
  setResetPassword,
  onExpiredPassword,
  initialOtpEmail
}: LoginFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isValid }
  } = useForm<IAuthLogin>({
    resolver: yupResolver(schema),
    context: { isCodeSent }
  });
  const [api, contextHolder] = notification.useNotification();

  const [showPassword, setShowPassword] = useState(false);

  const handleSendLoginOtp = async () => {
    setTimeLeft(RESEND_COOLDOWN_SECONDS);
    const result = await sendLoginOtp();
    if (result.status !== 200) {
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: result.message || "No se pudo enviar el código. Inténtalo de nuevo más tarde."
      });
      return;
    }
    setIsCodeSent(true);
    openNotification({
      api: api,
      type: "success",
      title: "¡Revisa tu correo!",
      message: "Te hemos enviado un código de acceso único. Ingrésalo para continuar."
    });
  };

  const onSubmitHandler = async ({ email, password, otp }: IAuthLogin) => {
    setIsLoading(true);

    if (isCodeSent && otp) {
      const result = await verifyLoginOtp(otp);
      if (result.status !== 200) {
        setIsLoading(false);
        setIsInvalidCode(true);
        openNotification({
          api: api,
          type: "error",
          title: "Error",
          message: result.message || "El código no es válido o ha expirado."
        });
        return;
      }
      // Volver a evaluar la política: el OTP puede no ser lo único pendiente.
      const outcome = await continueLoginAfterAuth(router);
      setIsLoading(false);
      if (outcome.step === "expiredPassword") {
        onExpiredPassword?.(outcome.email);
      }
      return;
    }

    const outcome = await signInWithPolicyCheck(
      email.trim(),
      password as string,
      router,
      openNotification,
      api
    );
    setIsLoading(false);
    if (outcome.step === "otp") {
      await handleSendLoginOtp();
      reset({ email });
      return;
    }
    if (outcome.step === "expiredPassword") {
      onExpiredPassword?.(outcome.email);
      return;
    }
    reset({ email });
  };

  const handleForgotPassword = () => {
    setResetPassword(true);
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!initialOtpEmail) return;
    reset({ email: initialOtpEmail });
    handleSendLoginOtp();
    // Solo al montar: initialOtpEmail lo fija el padre al renderizar este paso,
    // no debe reejecutarse en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className="loginForm" onSubmit={handleSubmit(onSubmitHandler)}>
      {contextHolder}
      <h4 className="loginForm__title">Inicia sesión</h4>

      <Flex vertical gap={"1.5rem"} className="loginForm__content">
        {isCodeSent ? (
          <div>
            <p className="loginForm__otpTitle">
              Hemos enviado el código de autenticación al correo{" "}
              <span className="loginForm__otpTitle__bold">{getValues("email")}</span>
            </p>
            <div className="otpInputContainer">
              <Controller
                name="otp"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input.OTP
                    className="inputOtp"
                    size="large"
                    variant={isInvalidCode ? "outlined" : "filled"}
                    inputMode="numeric"
                    length={6}
                    status={isInvalidCode ? "error" : ""}
                    {...field}
                    onChange={(value) => {
                      setIsInvalidCode(false);
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </div>
            {isInvalidCode && <p className="loginForm__otpError">Código inválido</p>}
            {timeLeft > 0 ? (
              <p className="loginForm__otpResentCode">Reenviar en {timeLeft}s</p>
            ) : (
              <p onClick={handleSendLoginOtp} className="loginForm__otpResentCode">
                Reenviar código
              </p>
            )}
          </div>
        ) : (
          <>
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
                          <Eye
                            onClick={() => setShowPassword(true)}
                            className={"iconEyePassword"}
                          />
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
               y {" "}
              <Link
                className="loginForm__link"
                href={"https://profitline.com.co/politicas-proteccion-datos-personales-habeas-data"}
                target="_blank"
              >
                Política de tratamiento de datos
              </Link>
            </p>
          </>
        )}
      </Flex>
      <PrincipalButton disabled={!isValid} loading={isLoading} htmlType="submit">
        {isLoading ? "Cargando..." : isCodeSent ? "Validar código" : "Iniciar sesión"}
      </PrincipalButton>
    </form>
  );
};
