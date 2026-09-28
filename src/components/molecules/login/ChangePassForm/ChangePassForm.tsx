import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Flex, Input, notification, Tooltip } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import { Eye, EyeClosed } from "phosphor-react";

import "./changePassForm.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { completeLoginAfterPasswordChange } from "../../../../../firebase-utils";
import { openNotification } from "@/components/atoms/Notification/Notification";
import {
  changePassword,
  confirmPasswordReset as confirmPasswordResetApi
} from "@/services/auth/authPolicy";

interface IChangePassForm {
  password: string;
  confirmPassword: string;
}

interface IChangePassFormProps {
  // "expired": el usuario ya está autenticado en Firebase (acaba de iniciar
  // sesión con una contraseña por vencer), así que no hay oobCode en la URL;
  // el correo llega por prop para mostrarlo y para reautenticar tras el cambio.
  mode: "accept" | "change" | "expired";
  email?: string;
  // Permite que el padre (Login.tsx) pase al paso de OTP si el mismo login
  // también requiere validación periódica una vez actualizada la contraseña.
  // eslint-disable-next-line no-unused-vars
  onRequireOtp?: (email: string) => void;
}

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede tener más de 32 caracteres")
    .matches(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .matches(/\d/, "La contraseña debe contener al menos un número")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe contener al menos un carácter especial")
    .required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required()
});

export const ChangePassForm = ({ mode, email, onRequireOtp }: IChangePassFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const oobCode = mode === "expired" ? null : searchParams.get("oobCode");
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IChangePassForm>({
    resolver: yupResolver(schema),
    mode: "onTouched"
  });

  const [showPassword, setShowPassword] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
    password: false,
    confirmPassword: false
  });

  // El oobCode se consume contra el backend en vez de contra Firebase
  // directamente: así el servidor observa el cambio y puede resellar la fecha
  // de vencimiento de la contraseña.
  const onSubmitOobCodeHandler = async ({ password }: IChangePassForm) => {
    if (!oobCode) return;
    setIsLoading(true);
    const result = await confirmPasswordResetApi(oobCode, password);
    if (result.status !== 200) {
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message:
          result.message || "Hubo un error al restablecer la contraseña, pruebe mandar otro correo"
      });
      setIsLoading(false);
      return;
    }
    openNotification({
      api: api,
      type: "success",
      title: mode === "change" ? "Contraseña restablecida" : "Invitación aceptada",
      message:
        mode === "change" ? "Tu contraseña ha sido restablecida" : "Tu invitación ha sido aceptada"
    });
    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
    setIsLoading(false);
  };

  // Contraseña vencida: el usuario ya está autenticado, así que se cambia con
  // su propio token y se reanuda el login, que seguirá al OTP si corresponde.
  const onSubmitExpiredHandler = async ({ password }: IChangePassForm) => {
    if (!email) return;
    setIsLoading(true);
    try {
      const result = await changePassword(password);
      if (result.status !== 200) {
        openNotification({
          api: api,
          type: "error",
          title: "Error",
          message: result.message || "Hubo un error al actualizar la contraseña"
        });
        setIsLoading(false);
        return;
      }
      const outcome = await completeLoginAfterPasswordChange(email, password, router);
      if (outcome.step === "otp") {
        onRequireOtp?.(email);
      }
      // "success" ya redirigió dentro de completeLoginAfterPasswordChange.
    } catch (error) {
      openNotification({
        api: api,
        type: "error",
        title: "Error",
        message: "Hubo un error al actualizar la contraseña, inténtalo de nuevo"
      });
    }
    setIsLoading(false);
  };

  const onSubmitHandler =
    mode === "expired" ? onSubmitExpiredHandler : onSubmitOobCodeHandler;

  const texts =
    mode === "accept"
      ? {
          title: "Aceptar invitación",
          description: "Crea una nueva contraseña"
        }
      : mode === "expired"
        ? {
            title: "Tu contraseña ha vencido",
            description: "Crea una nueva contraseña para continuar"
          }
        : {
            title: "Restablece tu contraseña",
            description: "Ingresa tu nueva contraseña"
          };
  if (mode !== "expired" && !oobCode) return;
  if (mode === "expired" && !email) return;
  return (
    <form className="changePassForm" onSubmit={handleSubmit(onSubmitHandler)}>
      {contextHolder}
      <Flex vertical gap={"0.5rem"}>
        <h4 className="changePassForm__title">{texts.title}</h4>
        <p>{texts.description}</p>
      </Flex>

      <Flex vertical gap={"1.5rem"} className="changePassForm__content">
        <div>
          <p className="changePassForm__inputTitle">Nueva Contraseña</p>
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <>
                <Input
                  size="large"
                  type={showPassword.password ? "text" : "password"}
                  className="inputPassword"
                  placeholder="Contrasena"
                  variant="borderless"
                  required
                  autoComplete="current-password"
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  suffix={
                    <Tooltip title={showPassword.password ? "Hidden Password" : "Show Password"}>
                      {!showPassword.password ? (
                        <Eye
                          onClick={() => {
                            setShowPassword((prevState) => ({
                              ...prevState,
                              password: true
                            }));
                          }}
                          className="iconEyePassword"
                        />
                      ) : (
                        <EyeClosed
                          onClick={() => {
                            setShowPassword((prevState) => ({
                              ...prevState,
                              password: false
                            }));
                          }}
                          className="iconEyePassword"
                        />
                      )}
                    </Tooltip>
                  }
                  {...field}
                />

                {errors.password && <div className="errorMessage">{errors.password.message}</div>}
              </>
            )}
          />
        </div>
        <div>
          <p className="changePassForm__inputTitle">Confirmar contraseña</p>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <>
                <Input
                  size="large"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  className="inputPassword"
                  placeholder="Contrasena"
                  variant="borderless"
                  required
                  autoComplete="current-password"
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  suffix={
                    <Tooltip
                      title={showPassword.confirmPassword ? "Hidden Password" : "Show Password"}
                    >
                      {!showPassword.confirmPassword ? (
                        <Eye
                          onClick={() =>
                            setShowPassword((prevState) => ({
                              ...prevState,
                              confirmPassword: true
                            }))
                          }
                          className="iconEyePassword"
                        />
                      ) : (
                        <EyeClosed
                          onClick={() =>
                            setShowPassword((prevState) => ({
                              ...prevState,
                              confirmPassword: false
                            }))
                          }
                          className="iconEyePassword"
                        />
                      )}
                    </Tooltip>
                  }
                  {...field}
                />
                {errors.confirmPassword && (
                  <div className="errorMessage">{errors.confirmPassword.message}</div>
                )}
              </>
            )}
          />
        </div>
      </Flex>

      <PrincipalButton disabled={!isValid} loading={isLoading} htmlType="submit">
        {mode === "expired" ? "Actualizar contraseña" : "Restablecer contraseña"}
      </PrincipalButton>
    </form>
  );
};
