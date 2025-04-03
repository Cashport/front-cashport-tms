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
          message: "Usuario o contraseña incorrectos"
        });
      });
  }
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
