/* eslint-disable no-unused-vars */
import { Button, Collapse, Flex, Tag, Typography } from "antd";
import { CaretDown, Receipt, Truck } from "phosphor-react";
import styles from "./novelty.module.scss";
import { FC, useState } from "react";
import { NoveltyTable } from "@/components/molecules/tables/NoveltyTable/Novelty";
import { ITransferJourney, ITripJourney } from "@/types/transferJourney/ITransferJourney";
import { formatMoney } from "@/utils/utils";

const { Text } = Typography;

interface INoveltyProps {
  transferRequestId: number | null;
  openDrawer: () => void;
  // eslint-disable-next-line no-unused-vars
  handleShowDetails: (id: number) => void;
  handleOpenCreateDrawer: () => void;
  transferJournies: ITransferJourney[];
  setTripId: (id: number) => void;
  setTripData: (data: {
    idCarrier: number;
    idVehicleType: number;
    canEditNovelties: boolean;
  }) => void;
  resetNovelty: () => void;
  handleOpenMTModal: () => void;
}

export const Novelty: FC<INoveltyProps> = ({
  openDrawer,
  handleShowDetails,
  transferJournies,
  handleOpenCreateDrawer,
  setTripId,
  setTripData,
  resetNovelty,
  handleOpenMTModal
}) => {
  const [key, setKey] = useState<number | null>(null);

  const TripHeader = ({ trip, isHeader = false }: { trip: ITripJourney; isHeader?: boolean }) => (
    <div className={`${styles.resumContainer} ${isHeader && styles.marginBottom}`}>
      <div className={styles.resum}>
        <div className={styles.resumItem}>
          <Text className={styles.text}>Vehículo</Text>
          <Text className={`${styles.text} ${styles.bold}`}>
            {trip.vehicle_type && (
              <>
                <Text ellipsis>{trip.vehicle_type}</Text>
                <span> / </span>
              </>
            )}
            <Text ellipsis>{trip.plate_number}</Text>
          </Text>
          <Flex style={{ marginLeft: "auto" }}>
            <Tag color={trip.trip_status_color}>{trip.trip_status}</Tag>
          </Flex>
        </div>
        <div className={styles.resumItem}>
          <Text className={styles.text}>Proveedor</Text>
          <Text className={`${styles.text} ${styles.bold}`}>{trip.provider}</Text>
        </div>
        <div className={styles.resumItem}>
          <Text className={styles.text}>Conductor</Text>
          <Text className={`${styles.text} ${styles.bold}`}>{trip.description}</Text>
        </div>
      </div>
      <div className={`${styles.resum} ${styles.right}`}>
        <div className={`${styles.resumItem} ${styles.right}`}>
          <Text className={styles.text}>Tarifa base</Text>
          <Text className={styles.text}>{formatMoney(trip.fare) || 0}</Text>
        </div>
        <div className={`${styles.resumItem} ${styles.right}`}>
          <Text className={styles.text}>Sobrecosto</Text>
          <Text className={styles.text}>{formatMoney(trip.surcharge) || 0}</Text>
        </div>
        <div className={`${styles.resumItem} ${styles.right}`}>
          <Text className={`${styles.text} ${styles.bold}`}>Total</Text>
          <Text className={`${styles.text} ${styles.bold}`}>{formatMoney(trip.total) || 0}</Text>
        </div>
      </div>
    </div>
  );

  const TitleComponent = ({ journey }: { journey: ITransferJourney }) => (
    <div className={styles.header}>
      <div className={styles.stateContainer}>
        <Truck size={27} color="#FFFFFF" weight="fill" />
        <Text className={styles.state}>{journey.description}</Text>
      </div>
      <div className={styles.fromto}>
        <div className={styles.fromtoContainer}>
          <Text className={styles.title}>Origen</Text>
          <Text className={styles.subtitle}>{journey.start_location}</Text>
        </div>
        <div className={`${styles.fromtoContainer} ${styles.right}`}>
          <div className={styles.fromtoContainer}>
            <Text className={styles.title}>Destino</Text>
            <Text className={styles.subtitle}>{journey.end_location}</Text>
          </div>
          <CaretDown
            className={`${styles.caret} ${journey.id === key && styles.rotate}`}
            size={24}
          />
        </div>
      </div>
      {journey.id !== key &&
        journey.trips.map((trip) => <TripHeader key={trip.id} isHeader trip={trip} />)}
    </div>
  );

  return (
    <div className={styles.collapsableContainer}>
      {transferJournies?.map((journey) => (
        <div key={journey.id} className={styles.collapsable}>
          <Collapse
            onChange={(item) => setKey(Number(item[0]))}
            expandIconPosition="end"
            ghost
            items={[
              {
                key: journey.id,
                label: <TitleComponent journey={journey} />,
                children: (
                  <div className={styles.contentContainer}>
                    {journey.trips.map((trip) => (
                      <div key={trip.id}>
                        <TripHeader trip={trip} />
                        <NoveltyTable
                          novelties={trip.novelties}
                          openDrawer={() => openDrawer()}
                          handleShowDetails={(t) => {
                            setTripData({
                              idCarrier: trip.id_provider,
                              idVehicleType: trip.id_vehicle_type,
                              canEditNovelties: !!trip.edit_novelties
                            });
                            handleShowDetails(t);
                          }}
                        />
                        <Flex gap={8} justify="flex-end" align="flex-end">
                          <button
                            className={styles.buttonTransparent}
                            onClick={() => {
                              handleOpenMTModal();
                              setTripId(trip.id);
                              setTripData({
                                idCarrier: trip.id_provider,
                                idVehicleType: trip.id_vehicle_type,
                                canEditNovelties: !!trip.edit_novelties
                              });
                            }}
                          >
                            <Receipt size={20} />
                            <p>Ver MT</p>
                          </button>
                          <div className={styles.btnContainer}>
                            <Button
                              onClick={() => {
                                handleOpenCreateDrawer();
                                setTripId(trip.id);
                                setTripData({
                                  idCarrier: trip.id_provider,
                                  idVehicleType: trip.id_vehicle_type,
                                  canEditNovelties: !!trip.edit_novelties
                                });
                                resetNovelty();
                              }}
                              className={styles.btn}
                              disabled={trip.edit_novelties === 0}
                              type="text"
                              size="large"
                            >
                              <Text className={styles.text}>Crear una novedad</Text>
                            </Button>
                          </div>
                        </Flex>
                      </div>
                    ))}
                  </div>
                ),
                showArrow: false
              }
            ]}
          />
        </div>
      ))}
    </div>
  );
};
