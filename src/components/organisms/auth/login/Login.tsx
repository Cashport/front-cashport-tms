import { useState } from "react";
import { Flex } from "antd";

import { LoginForm } from "../../forms/LoginForm/LoginForm";
import { InfoCardLogin } from "@/components/molecules/login/InfoCardLogin/InfoCardLogin";
import { RestartPassword } from "@/components/molecules/login/RestartPassword/RestartPassword";
import useScreenWidth from "@/components/hooks/useScreenWidth";

import styles from "./login.module.scss";
import { ContactUsButton } from "@/components/atoms/buttons/contactUsButton/ContactUsButton";
import { LogoCashport } from "@/components/atoms/logoCashport/LogoCashport";

export const LoginView = () => {
  const [resetPassword, setResetPassword] = useState(false);
  const width = useScreenWidth();

  return (
    <main className={styles.containerLogin}>
      <InfoCardLogin />
      <Flex className={styles.loginSection} align="center" justify="center" vertical>
        <Flex className={styles.login} vertical align="center" justify="space-between">
          <div className={styles.login__title}>
            <LogoCashport width={width && width > 400 ? 370 : width} />
          </div>
          {!resetPassword ? (
            <LoginForm setResetPassword={setResetPassword} />
          ) : (
            <RestartPassword setResetPassword={setResetPassword} />
          )}
          <ContactUsButton />
        </Flex>
      </Flex>
    </main>
  );
};
