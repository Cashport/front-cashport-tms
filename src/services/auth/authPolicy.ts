import axios, { AxiosError } from "axios";
import config from "@/config";
import { API } from "@/utils/api/api";
import {
  IAuthActionResponse,
  ILoginStatusData,
  ILoginStatusResponse,
  IVerifyOtpResponse
} from "@/types/auth/authPolicy";
import { getDeviceToken, setDeviceToken } from "@/utils/auth/trustedDevice";

/**
 * A diferencia del wrapper de Cashport, el interceptor de `API` en este repo
 * deja que axios lance en 4xx/5xx. Estas funciones normalizan el error a la
 * misma forma `{ status, message }` de la respuesta exitosa, para que los
 * componentes puedan leer `result.status !== 200` sin envolver todo en
 * try/catch.
 */
const toActionResponse = (error: unknown): IAuthActionResponse => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return {
    status: axiosError?.response?.status ?? 500,
    message:
      axiosError?.response?.data?.message ??
      "No se pudo completar la operación. Por favor intenta de nuevo."
  };
};

/**
 * Decide si el usuario recién autenticado con Firebase puede entrar directo o
 * si debe pasar por OTP y/o cambio de contraseña.
 *
 * Es la única función del módulo que propaga el error en vez de absorberlo: si
 * este endpoint no responde, es preferible fallar el login a saltarse la
 * validación en silencio.
 */
export const getLoginStatus = async (): Promise<ILoginStatusData> => {
  const deviceToken = getDeviceToken();
  const response: ILoginStatusResponse = await API.post(
    "/auth/login-status",
    {},
    deviceToken ? { headers: { "x-device-token": deviceToken } } : undefined
  );
  return response.data;
};

export const sendLoginOtp = async (): Promise<IAuthActionResponse> => {
  try {
    const response: IAuthActionResponse = await API.post("/auth/otp/send");
    return { status: response?.status ?? 200, message: response?.message ?? "" };
  } catch (error) {
    return toActionResponse(error);
  }
};

/**
 * Valida el código y, si el proyecto permite dispositivos de confianza, guarda
 * el token que devuelve el backend para no volver a pedir OTP en este equipo.
 */
export const verifyLoginOtp = async (otp: string): Promise<IAuthActionResponse> => {
  try {
    const response: IVerifyOtpResponse = await API.post("/auth/otp/verify", { otp });
    setDeviceToken(response?.data?.deviceToken ?? null);
    return { status: response?.status ?? 200, message: response?.message ?? "" };
  } catch (error) {
    return toActionResponse(error);
  }
};

export const changePassword = async (password: string): Promise<IAuthActionResponse> => {
  try {
    const response: IAuthActionResponse = await API.post("/auth/change-password", { password });
    return { status: response?.status ?? 200, message: response?.message ?? "" };
  } catch (error) {
    return toActionResponse(error);
  }
};

/**
 * Consume el oobCode del correo de "olvidé mi contraseña" / invitación contra
 * el backend en vez de contra Firebase directamente: así el servidor observa
 * el cambio y puede resellar `password_expires_at`.
 *
 * Usa axios pelado a propósito: el interceptor de `API` exige un ID token de
 * Firebase y aquí todavía no hay ninguna sesión iniciada.
 */
export const confirmPasswordReset = async (
  oobCode: string,
  newPassword: string
): Promise<IAuthActionResponse> => {
  try {
    const { data } = await axios.post<IAuthActionResponse>(
      `${config.API_HOST}/auth/reset-password/confirm`,
      { oobCode, newPassword }
    );
    return { status: data?.status ?? 200, message: data?.message ?? "" };
  } catch (error) {
    return toActionResponse(error);
  }
};
