import { Typography } from "antd";
import styles from './Resum.module.scss';
import { ISocketTrip } from "@/types/logistics/trips/TripsSchema";
import { FC } from "react";
import dayjs from "dayjs";
import { getTravelDuration } from "@/utils/logistics/maps";
import { IDriverMap } from "@/types/logistics/driver/driver";

const Text = Typography;

interface IResumProps {
  trip: ISocketTrip;
  driver: IDriverMap | null;
}

const Resum: FC<IResumProps> = ({ trip, driver }) => {
  return (
    <div className={styles.mainResum}>
      <Text className={styles.title}>Datos de contacto</Text>
      <Text className={`${styles.text} ${styles.bold} ${styles.subtitle}`}>Contacto inicial</Text>
      <div className={`${styles.contactContainer} ${styles.margin}`}>
        <Text className={styles.text}>{trip.initialContact.name || '--'}</Text>
        <Text className={`${styles.text} ${styles.underline}`}>{trip.initialContact.phone}</Text>
      </div>
      {/* <div className={styles.contactContainer}>
        <Text className={styles.text}>Jairo Mora</Text>
        <Text className={`${styles.text} ${styles.underline}`}>{316 846 9035}</Text>
      </div> */}
      <Text className={`${styles.text} ${styles.bold} ${styles.subtitle}`}>Contacto final</Text>
      <div className={`${styles.contactContainer} ${styles.margin}`}>
        <Text className={styles.text}>{trip.finalContact.name || '--'}</Text>
        <Text className={`${styles.text} ${styles.underline}`}>{trip.finalContact.phone}</Text>
      </div>
      <div className={`${styles.contactContainer} ${styles.subtitleMargin}`}>
        <Text className={`${styles.text} ${styles.bold}`}>Solicitante</Text>
        <Text className={styles.text}>{driver?.user || '--'}</Text>
      </div>
      <div className={`${styles.contactContainer} ${styles.subtitleMargin}`}>
        <Text className={`${styles.text} ${styles.bold}`}>Cliente final</Text>
        <Text className={styles.text}>{driver?.final_client}</Text>
      </div>
      <Text className={`${styles.title} ${styles.margin}`}>Resumen</Text>
      <div className={styles.resumContainer}>
        <div className={styles.contactContainer}>
          <Text className={styles.resumText}>Distancia total</Text>
          <Text className={`${styles.resumText} ${styles.bold}`}>{trip.geometry.geometry[0].distance} Km</Text>
        </div>
        <div className={styles.contactContainer}>
          <Text className={styles.resumText}>Tiempo estimado</Text>
          <Text className={`${styles.resumText} ${styles.bold}`}>{getTravelDuration(trip.geometry.geometry[0].duration)} h</Text>
        </div>
        <div className={styles.contactContainer}>
          <Text className={styles.resumText}>Volumen</Text>
          <Text className={`${styles.resumText} ${styles.bold}`}>00</Text>
        </div>
        <div className={styles.contactContainer}>
          <Text className={styles.resumText}>Peso</Text>
          <Text className={`${styles.resumText} ${styles.bold}`}>{trip.volume}</Text>
        </div>
        <div className={styles.contactContainer}>
          <Text className={styles.resumText}>Fecha de creación</Text>
          <Text className={`${styles.resumText} ${styles.bold}`}>{dayjs(trip.createdAt).format('DD [de] MMMM [de] YYYY')}</Text>
        </div>
      </div>
      <Text className={`${styles.title} ${styles.margin}`}>Instrucciones especiales</Text>
      <Text className={styles.specialText}>{driver?.observations}</Text>
    </div>
  )
}

export default Resum;