import { Dispatch, SetStateAction, useState } from "react";
import { Flex } from "antd";

import { LoginForm } from "../../forms/LoginForm/LoginForm";
import { InfoCardLogin } from "@/components/molecules/login/InfoCardLogin/InfoCardLogin";
import { RestartPassword } from "@/components/molecules/login/RestartPassword/RestartPassword";
import { ChangePassForm } from "@/components/molecules/login/ChangePassForm/ChangePassForm";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import styles from "./login.module.scss";
import { ContactUsButton } from "@/components/atoms/buttons/contactUsButton/ContactUsButton";
import { LogoCashport } from "@/components/atoms/logoCashport/LogoCashport";

type LoginStep = "login" | "reset" | "expiredPassword";

export const LoginView = () => {
  const width = useScreenWidth();
  const [step, setStep] = useState<LoginStep>("login");
  // El correo viaja entre pasos: se muestra en la pantalla de contraseña
  // vencida y se devuelve a LoginForm para saltar directo al OTP si el mismo
  // login también requiere validarlo después del cambio de contraseña.
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | undefined>(undefined);

  // Se mantiene tipado como Dispatch<SetStateAction<boolean>> para no romper el
  // contrato que ya esperan LoginForm y RestartPassword (ninguno le pasa una
  // función en la práctica, pero el tipo debe seguir aceptándola).
  const setResetPassword: Dispatch<SetStateAction<boolean>> = (value) => {
    const next = typeof value === "function" ? value(step === "reset") : value;
    setStep(next ? "reset" : "login");
  };

  const handleExpiredPassword = (email: string) => {
    setPendingEmail(email);
    setPendingOtpEmail(undefined);
    setStep("expiredPassword");
  };

  const handleRequireOtpAfterPasswordChange = () => {
    setPendingOtpEmail(pendingEmail);
    setStep("login");
  };

  return (
    <main className={styles.containerLogin}>
      <InfoCardLogin />
      <Flex className={styles.loginSection} align="center" justify="center" vertical>
        <Flex className={styles.login} vertical align="center" justify="space-between">
          <div className={styles.login__title}>
            <LogoCashport width={width && width > 400 ? 370 : width} />
          </div>
          {step === "login" && (
            <LoginForm
              setResetPassword={setResetPassword}
              onExpiredPassword={handleExpiredPassword}
              initialOtpEmail={pendingOtpEmail}
            />
          )}
          {step === "reset" && <RestartPassword setResetPassword={setResetPassword} />}
          {step === "expiredPassword" && (
            <ChangePassForm
              mode="expired"
              email={pendingEmail}
              onRequireOtp={handleRequireOtpAfterPasswordChange}
            />
          )}
          <ContactUsButton />
        </Flex>
      </Flex>
    </main>
  );
};
