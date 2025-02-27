import { Flex, Typography } from "antd";
import styles from "./CustomTag.module.scss";
const { Text } = Typography;

interface CustomTagProps {
  text: string;
  color: string;
}

const CustomTag: React.FC<CustomTagProps> = ({ text, color }) => {
  return (
    <Flex align="center" className={styles.customTag} style={{ borderColor: color }}>
      <div className={styles.customTagCircle} style={{ backgroundColor: color }} />
      <Text className={styles.customTagText}>{text}</Text>
    </Flex>
  );
};

export default CustomTag;
