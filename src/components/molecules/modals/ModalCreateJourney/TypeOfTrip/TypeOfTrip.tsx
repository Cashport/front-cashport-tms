import { Flex } from "antd";
import styles from "./TypeOfTrip.module.scss";
import Image from "next/image";
import { FooterButtons } from "../components/FooterButtons/FooterButtons";
import { typeOfTrip } from "../utils/types";

type TypeOfTripProps = {
  typeActive: typeOfTrip | null;
  // eslint-disable-next-line no-unused-vars
  handleTypeClick: (type: typeOfTrip) => void;
  handleBack: () => void;
  handleNext: () => void;
  disabled: boolean;
};

const TypeOfTrip = ({
  typeActive,
  handleTypeClick,
  handleBack,
  handleNext,
  disabled
}: TypeOfTripProps) => {
  console.log("typeActive", typeActive);
  return (
    <Flex vertical gap={24}>
      <Flex gap={32}>
        <button
          type="button"
          id={"CARGA"}
          className={["tripTypes", typeActive === typeOfTrip.CARGA ? "active" : undefined].join(
            " "
          )}
          onClick={() => handleTypeClick(typeOfTrip.CARGA)}
          disabled={disabled}
        >
          <div className={styles.tripTypeIcons}>
            <Image
              className={styles.icon}
              loading="lazy"
              width={27}
              height={27}
              alt=""
              src="/images/logistics/truck.svg"
            />
            <div className="text">Carga</div>
          </div>
        </button>
        <button
          type="button"
          id={"IZAJE"}
          className={["tripTypes", typeActive === typeOfTrip.IZAJE ? "active" : undefined].join(
            " "
          )}
          onClick={() => handleTypeClick(typeOfTrip.IZAJE)}
          disabled={disabled}
        >
          <div className={styles.tripTypeIcons}>
            <Image
              className={styles.icon}
              loading="lazy"
              width={27}
              height={27}
              alt=""
              src="/images/logistics/izaje.svg"
            />
            <div className="text">Izaje</div>
          </div>
        </button>
        <button
          type="button"
          id={"PERSONAL"}
          className={["tripTypes", typeActive === typeOfTrip.PERSONAL ? "active" : undefined].join(
            " "
          )}
          onClick={() => handleTypeClick(typeOfTrip.PERSONAL)}
          disabled={disabled}
        >
          <div className={styles.tripTypeIcons}>
            <Image
              className={styles.icon}
              loading="lazy"
              alt="Personal"
              src="/images/logistics/users.svg"
              width={27}
              height={27}
            />
            <div className="text">Personal</div>
          </div>
        </button>
      </Flex>
      <FooterButtons
        backTitle="Cancelar"
        nextTitle="Siguiente"
        handleBack={handleBack}
        handleNext={handleNext}
        nextDisabled={!typeActive}
      />
    </Flex>
  );
};

export default TypeOfTrip;
