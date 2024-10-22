import { ConfigProvider, Timeline, Typography } from "antd";
import styles from './Tracking.module.scss';
import { Camera } from "phosphor-react";
import { IDriverTimeLine } from "@/types/logistics/driver/driver";
import { FC } from "react";
import dayjs from "dayjs";

dayjs.locale('es')

const Text = Typography;

interface ITrackingProps {
  timeline: IDriverTimeLine[];
}

const Tracking: FC<ITrackingProps> = ({ timeline }) => {
  const timeLineItems =
    timeline.map((item) => {
      return {
        dot: (
          <div className={styles.dot}>
            {item.evidence && (
              <div className={styles.camera}>
                <Camera size={19} color="#141414" />
              </div>
            )}
          </div>
        ),
        children: (
          <div className={styles.content}>
            <Text className={styles.title}>{item.description} <span className={`${styles.title} ${styles.bold}`}>{item.aditionalData && item.aditionalData}</span></Text>
            <Text className={styles.subtitle}>{dayjs(item.date).format('DD MMMM, YYYY - HH:mm')}</Text>
            <Text className={`${styles.subtitle} ${styles.light}`}>Conductor: {item.driverName}</Text>
          </div>
        )
      };
    }) || [];

  return (
    <div className={styles.mainTimeLine}>
      <ConfigProvider
        theme={{
          components: {
            Timeline: {
              tailColor: "#CBE71E",
              dotBg: "none"
            }
          }
        }}
      >
        <div className="custom-timeline">
          <Timeline items={timeLineItems || []} />
        </div>
      </ConfigProvider>
    </div>
  )
}

export default Tracking;