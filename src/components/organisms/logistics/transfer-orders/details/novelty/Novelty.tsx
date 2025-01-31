/* eslint-disable no-unused-vars */
import { Button, Collapse, Flex, Typography } from "antd";
import { Receipt } from "phosphor-react";
import styles from "./novelty.module.scss";
import { FC, useState } from "react";
import { NoveltyTable } from "@/components/molecules/tables/NoveltyTable/Novelty";
import { ITransferJourney } from "@/types/transferJourney/ITransferJourney";
import { RequirementHeader } from "@/components/molecules/collapse/Requirementheader/RequirementHeader";
import { TripHeader } from "@/components/molecules/collapse/TripHeader/TripHeader";
import { TitleComponent } from "@/components/molecules/collapse/TitleComponent/TitleComponent";

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
                label: <TitleComponent journey={journey} activeKey={key} />,
                children: (
                  <div className={styles.contentContainer}>
                    {journey.requirements?.map((req) => (
                      <div key={req.id}>
                        <RequirementHeader key={req.id} isHeader requirement={req} />
                      </div>
                    ))}
                    {journey.trips?.map((trip) => (
                      <div key={trip.id}>
                        <TripHeader trip={trip} />
                        <NoveltyTable
                          novelties={trip.novelties ?? []}
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
