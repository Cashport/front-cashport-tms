import React, { FC } from "react";
import styles from "./timeline-events.module.scss";

interface TimelineEventsProps {
  events:
    | {
        id: number;
        title: string;
        date?: string;
        content?: React.ReactNode;
        leftIcon?: React.ReactNode;
        handleLeftIconClick?: () => void;
        tag?: React.ReactNode;
      }[]
    | undefined;
}

const TimelineEvents: FC<TimelineEventsProps> = ({ events }) => {
  return (
    <div className={styles.timeLineEventscontent}>
      <div className={styles.progress} />

      <div className={styles.stepperContainer}>
        {events?.map((event, index, arr) => (
          <div key={event.id} className={styles.mainStep}>
            {event.leftIcon ? (
              <div className={styles.leftIcon} onClick={event.handleLeftIconClick}>
                {event.leftIcon}
              </div>
            ) : null}

            <div
              className={`${styles.stepLine} ${index === arr.length - 1 ? styles.inactive : styles.active}`}
            />
            <div className={`${styles.stepCircle} ${styles.active}`} />
            <div className={styles.stepLabel}>
              <div className={styles.cardInvoiceFiling}>
                <div className={styles.title}>
                  <h5 className={styles.eventName}>{event.title}</h5>
                  {event.tag && event.tag}
                </div>
                {event.date ? <p className={styles.date}>{event.date}</p> : null}
                {event.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TimelineEvents;
