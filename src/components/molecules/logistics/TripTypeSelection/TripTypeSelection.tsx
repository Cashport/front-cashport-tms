import { FunctionComponent } from "react";
import TripTypes from "../../../atoms/logistics/TripTypes/TripTypes";
import styles from "./TripTypeSelection.module.css";
import { Flex } from "antd";

export type TripTypeSelectionType = {
  className?: string;
};

const TripTypeSelection: FunctionComponent<TripTypeSelectionType> = ({
  className = "",
}) => {
  return (
    <Flex gap="middle">
      <TripTypes truck="/images/logistics/truck.svg" carga="Carga" />
          <TripTypes
            truck="/images/logistics/izaje.svg"
            carga="Izaje"
            propWidth="32.5px"
            propTextDecoration="unset"
            propMinWidth="36px"
          />
          <TripTypes
            truck="/images/logistics/users.svg"
            carga="Personal"
            propWidth="27px"
            propTextDecoration="none"
            propMinWidth="69px"
          />
    </Flex>
  );
};

export default TripTypeSelection;
