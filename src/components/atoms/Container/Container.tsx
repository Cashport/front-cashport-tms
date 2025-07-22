import { Flex } from "antd";
import styles from "./Container.module.scss";

interface IContainer {
  children: React.ReactNode;
  customStyles?: React.CSSProperties;
}

export default function Container({ children, customStyles }: Readonly<IContainer>) {
  return (
    <Flex vertical className={styles.container} style={customStyles}>
      {children}
    </Flex>
  );
}
