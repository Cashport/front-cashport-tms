/* eslint-disable no-unused-vars */
import { FC, useState } from "react";
import { Button, Typography } from "antd";
import { CaretLeft, ChatCircleText, CheckCircle, Star } from "phosphor-react";
import { ISocketTrip } from "@/types/logistics/trips/TripsSchema";
import { TripState } from "@/utils/constants/tripState";
import styles from './Detail.module.scss';
import Image from "next/image";
import Tracking from "./tracking/Tracking";
import Resum from "./Resum/Resum";
import Document from "./Document/Document";
import { calculateDistanceFromCurrentLocation } from "@/utils/logistics/calculateDistanceMap";
import { IDriverMap } from "@/types/logistics/driver/driver";
import { Empty } from "@phosphor-icons/react";

const Text = Typography;

interface IDetailTripMapProps {
  trip: ISocketTrip;
  driver: IDriverMap | null;
  lat: number | null;
  long: number | null;
  distancePercent: number;
  onClose: () => void;
}

enum Tab {
  TRACKING = 'TRACKING',
  DETAILS = 'DETAILS',
  DOCUMENTS = 'DOCUMENTS'
}

const DetailTripMap: FC<IDetailTripMapProps> = ({ trip, lat, long, distancePercent, driver, onClose }) => {
  const [tab, setTab] = useState<Tab>(Tab.TRACKING);

  const getStateColor = (stateId: string) => {
    const getState = TripState.find((f) => f.id === stateId);
    return getState ? getState.bgColor : '#CBE71E';
  }

  const getStateTextColor = (stateId: string) => {
    const getState = TripState.find((f) => f.id === stateId);
    return getState ? getState.textColor : '#141414';
  }

  const renderTab = () => {
    switch (tab) {
      case Tab.TRACKING:
        return <Tracking timeline={driver ? driver.timeline : []} />
      case Tab.DETAILS:
        return <Resum trip={trip} driver={driver} />
      case Tab.DOCUMENTS:
        return <Document />
    }
  }

  return (
    <div className={styles.mainDetail}>
      <div className={styles.backContainer}>
        <Button onClick={onClose} className={styles.btn} type="text">
          <CaretLeft size={20} color="#FFFFFF" />
          <Text className={styles.btnText}>Regresar</Text>
        </Button>
        <div className={styles.stateContainer}>
          <a href={`/logistics/transfer-orders/details/${trip.transferRequestId}`}>
            <div onClick={() => {}} className={styles.tr}>TR-{trip.transferRequestId}</div>
          </a>
          <div className={styles.stateTag} style={{ backgroundColor: getStateColor(trip.stateId) }}>
            <CheckCircle size={16} color={getStateTextColor(trip.stateId)} />
            <div className={styles.state} style={{ color: getStateTextColor(trip.stateId) }}>{trip.state.name}</div>
          </div>
        </div>
      </div>
      <div className={styles.profileContainer}>
        <div className={styles.titleContainer}>
          {driver && driver.url_archive && (
            <Image className={styles.img} width={80} height={69} src={driver.url_archive} alt="" />
          )}
          {driver && !driver.url_archive && (
            <div className={`${styles.img} ${styles.emptyImg}`}>
              <Empty size={32} color="#FFFFFF" />
            </div>
            // <Image className={styles.img} width={80} height={69} src={driver.url_archive} alt="" />
          )}
          <div className={styles.textContainer}>
            <Text className={styles.title}>{driver?.name} {driver?.last_name}</Text>
            <div className={styles.qualifyContainer}>
              <Text className={styles.subtitle}>Calificación</Text>
              <Text className={`${styles.subtitle} ${styles.bold}`}>{driver?.qualification}</Text>
              <Star size={12} weight="fill" color="#F4BF00" />
            </div>
          </div>
        </div>
        <div className={styles.chatBtn}>
          <ChatCircleText size={20} color="#141414" />
        </div>
      </div>
      <div className={styles.squareComponent}>
        <div className={styles.square}>
          <Text className={styles.sqTitle}>{trip.tag}</Text>
          <Text className={styles.sqSubtitle}>Tipo de viaje</Text>
        </div>
        <div className={styles.square}>
          <Text className={styles.sqTitle}>{trip.vehicle.plateNumber}</Text>
          <Text className={styles.sqSubtitle}>{trip.vehicle.behicleType}</Text>
        </div>
        <div className={styles.square}>
          <Text className={styles.sqTitle}>{(((trip.geometry.geometry[0].distance * distancePercent) / 100) / 1000).toFixed(0) || 0} Kms</Text>
          <Text className={styles.sqSubtitle}>Kms recorridos</Text>
        </div>
        <div className={styles.square}>
          <Text className={styles.sqTitle}>{driver?.hoursTraveled || 0} Horas</Text>
          <Text className={styles.sqSubtitle}>Hrs de viaje</Text>
        </div>
      </div>
      <div className={styles.tabContainer}>
        <div onClick={() => setTab(Tab.TRACKING)} className={`${styles.tab} ${tab === Tab.TRACKING && styles.active}`}>Tracking</div>
        <div onClick={() => setTab(Tab.DETAILS)} className={`${styles.tab} ${tab === Tab.DETAILS && styles.active}`}>Detalles</div>
        {/* <div onClick={() => setTab(Tab.DOCUMENTS)} className={`${styles.tab} ${tab === Tab.DOCUMENTS && styles.active}`}>Documentos</div> */}
      </div>
      <div className={styles.contentTab}>
        {renderTab()}
      </div>
    </div>
  )
}

export default DetailTripMap;