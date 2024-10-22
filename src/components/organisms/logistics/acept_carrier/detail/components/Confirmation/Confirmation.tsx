import React, { Dispatch, SetStateAction, useState } from "react";
import { Col, Divider, Flex } from "antd";
import { ICarrierRequestDrivers, ICarrierRequestVehicles } from "@/types/logistics/schema";
import styles from "./confirmation.module.scss";
import TextArea from "antd/es/input/TextArea";
import CheckboxButton from "@/components/atoms/CheckboxButton/CheckboxButton";
import { FormMode } from "../../../view/AceptCarrierDetailView/AceptCarrierDetailView";
import Buttons from "../Buttons/Buttons";

interface ConfirmationProps {
  driverSelected: ICarrierRequestDrivers[];
  vehicleSelected: ICarrierRequestVehicles;
  setObservation: Dispatch<SetStateAction<any>>;
  formMode: FormMode;
  currentObservation: string;
  setView: Dispatch<SetStateAction<"detail" | "asignation" | "confirmation">>;
  handleReject: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  hasFormValuesChanged: () => boolean;
  showRejectButton: boolean;
}

export function Confirmation({
  driverSelected,
  vehicleSelected,
  setObservation,
  formMode,
  currentObservation,
  setView,
  handleReject,
  handleSubmit,
  hasFormValuesChanged,
  showRejectButton
}: Readonly<ConfirmationProps>) {
  const [aceptConditions, setAceptConditions] = useState<boolean>(false);
  const isFinishButtonShowed = formMode !== FormMode.VIEW;

  const isFinishButtonEnabled = () => {
    if (formMode === FormMode.CREATE && aceptConditions) return true;
    else if (formMode === FormMode.EDIT && hasFormValuesChanged() && aceptConditions) return true;
    else return false;
  };

  return (
    <div>
      <Flex className={styles.wrapper}>
        <Flex className={styles.sectionWraper} vertical>
          {driverSelected?.map((driver, index) => (
            <Flex key={`vehicle-driver-${index}`}>
              <Col span={11} style={{ visibility: index !== 0 ? "hidden" : "initial" }}>
                <p className={styles.subtitle}>
                  {vehicleSelected?.brand} {vehicleSelected?.color}
                </p>
                <p className={styles.subtitle}>{vehicleSelected?.plate_number}</p>
              </Col>
              <Col span={2}>
                <Divider type="vertical" className={styles.divider} />
              </Col>
              <Col span={11} style={{ display: "flex", justifyContent: "flex-end" }}>
                <p className={styles.subtitle}>
                  {driver?.name} {driver?.last_name} - {driver?.phone}
                </p>
              </Col>
            </Flex>
          ))}
        </Flex>
        <Flex vertical className={styles.sectionWraper}>
          <p className={styles.subtitle}>Comentarios</p>
          <div className={styles.textArea}>
            <TextArea
              value={currentObservation}
              disabled={formMode !== FormMode.CREATE}
              rows={4}
              onChange={(event) => {
                setObservation(event.target.value);
              }}
            />
          </div>
        </Flex>
        <Flex className={styles.confirmation} gap={16}>
          <CheckboxButton
            onChange={() => setAceptConditions(true)}
            disabled={formMode === FormMode.VIEW}
          />
          <div className={styles.text}>
            Conozco y confirmo que el conductor asignado debe cumplir con el requerimiento #1234567
          </div>
        </Flex>
      </Flex>
      <Buttons
        canContinue={isFinishButtonShowed}
        isRightButtonActive={isFinishButtonEnabled()}
        isLeftButtonActive={true}
        handleNext={handleSubmit}
        handleBack={() => setView("asignation")}
        handleReject={handleReject}
        isLastStep={true}
        showRejectButton={showRejectButton}
      />
    </div>
  );
}
