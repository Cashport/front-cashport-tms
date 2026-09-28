import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";
import { IOpenNotificationProps } from "@/components/atoms/Notification/Notification";
import { auth } from "./firebase";
import { STORAGE_TOKEN } from "@/utils/constants/globalConstants";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useAppStore } from "@/lib/store/store";
import { NotificationInstance } from "antd/es/notification/interface";
import { getLoginStatus } from "@/services/auth/authPolicy";

const getAuth = async (
  email: string,
  password: string,
  router: AppRouterInstance,
  isSignUp: any,
  // eslint-disable-next-line no-unused-vars
  openNotification: ({ api, title, message, placement }: IOpenNotificationProps) => void,
  api: NotificationInstance
) => {
  localStorage.removeItem(STORAGE_TOKEN);
  const { resetStore, setHydrated } = useAppStore.getState();
  resetStore();
  setHydrated();
  if (isSignUp) {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        const token = await userCred.user.getIdToken();
        fetch("/api/auth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await userCred.user.getIdToken()}`
          }
        }).then((response) => {
          localStorage.setItem(STORAGE_TOKEN, token);
          if (response.status === 200) {
            router.push("/");
          }
        });
      })
      .catch((error) => {
        alert(`Sign up failed: ${error.message} - ${error.code}`);
      });
  } else {
    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(async (userCred) => {
        const token = await userCred.user.getIdToken();
        fetch("/api/auth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            tokenExm: `${JSON.stringify(userCred)}`
          }
        }).then(async (response) => {
          const data = await response.json();
          if (response.status === 200) {
            localStorage.setItem(STORAGE_TOKEN, data.data.token);
            router.push("/landing");
          }
        });
      })
      .catch((error) => {
        console.error({ error });
        openNotification({
          api: api,
          type: "error",
          title: "Error",
          message: "Usuario/contraseña incorrectos o vencidos, revisa tu correo"
        });
      });
  }
};
export type LoginOutcome =
  | { step: "success" }
  | { step: "otp"; email: string }
  | { step: "expiredPassword"; email: string }
  | { step: "error" };

// Emite la cookie de sesión de Cashport para el usuario que ya está firmado en
// Firebase y entra a la app. Solo se llama cuando la política de OTP periódico
// y expiración de contraseña ya quedó satisfecha (o no aplica).
const mintSessionCookie = async (router: AppRouterInstance) => {
  const user = auth.currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      tokenExm: `${JSON.stringify(user)}`
    }
  });
  if (response.status === 200) {
    const data = await response.json();
    localStorage.setItem(STORAGE_TOKEN, data.data.token);
    router.push("/landing");
  }
};

// Consulta la política de OTP periódico / expiración de contraseña para el
// usuario ya firmado en Firebase y o bien completa el login (emite la cookie y
// redirige) o reporta qué paso extra debe mostrar la UI. Se llama justo
// después del sign-in, y de nuevo tras validar el OTP o cambiar la contraseña,
// de modo que cada remediación reevalúa naturalmente lo que sigue.
export const continueLoginAfterAuth = async (
  router: AppRouterInstance
): Promise<LoginOutcome> => {
  const status = await getLoginStatus();
  if (status.requiresPasswordChange) {
    return { step: "expiredPassword", email: status.email };
  }
  if (status.requiresOtp) {
    return { step: "otp", email: status.email };
  }
  await mintSessionCookie(router);
  return { step: "success" };
};

// Login por usuario y contraseña, igual que getAuth pero condicionado por la
// política de seguridad del proyecto en vez de redirigir sin más.
export const signInWithPolicyCheck = async (
  email: string,
  password: string,
  router: AppRouterInstance,
  // eslint-disable-next-line no-unused-vars
  openNotification: ({ api, title, message, placement }: IOpenNotificationProps) => void,
  api: NotificationInstance
): Promise<LoginOutcome> => {
  localStorage.removeItem(STORAGE_TOKEN);
  const { resetStore, setHydrated } = useAppStore.getState();
  resetStore();
  setHydrated();
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    console.error({ error });
    openNotification({
      api: api,
      type: "error",
      title: "Error",
      message: "Usuario/contraseña incorrectos o vencidos, revisa tu correo"
    });
    return { step: "error" };
  }
  try {
    return await continueLoginAfterAuth(router);
  } catch (error) {
    // No se pudo consultar la política: se falla el login en vez de dejar
    // pasar al usuario sin validar.
    console.error({ error });
    openNotification({
      api: api,
      type: "error",
      title: "Error",
      message: "No se pudo validar tu acceso. Por favor intenta de nuevo en unos minutos."
    });
    return { step: "error" };
  }
};

// Vuelve a autenticar con la contraseña recién establecida para que la sesión
// tenga un ID token fresco y definitivamente válido (el cambio desde el lado
// admin de Firebase puede o no invalidar el anterior), y retoma el flujo de
// login, que seguirá al OTP si también hace falta.
export const completeLoginAfterPasswordChange = async (
  email: string,
  newPassword: string,
  router: AppRouterInstance
): Promise<LoginOutcome> => {
  await signInWithEmailAndPassword(auth, email.trim(), newPassword);
  return await continueLoginAfterAuth(router);
};

const logOut = (router: AppRouterInstance) => {
  window.location.href = "/auth/login";
  signOut(auth);
  localStorage.removeItem(STORAGE_TOKEN);
  const { resetStore } = useAppStore.getState();
  resetStore();
};

const sendEmailResetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    handleError(error);
  }
};

const resetPassword = async (oobCode: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    handleError(error);
  }
};

export { getAuth, logOut, sendEmailResetPassword, resetPassword };

function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("An unknown error occurred:", error);
  }
  throw error;
}
