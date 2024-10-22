import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import styles from "../ModalCreateJourney.module.scss";
interface LocationDetails {
  location?: string;
  dateTime: string;
}
function extractDateAndTime(isoString: string): { date: string; time: string } {
  const dateObj = dayjs.utc(isoString);
  const date = dateObj.format("DD/MM/YYYY");
  const time = dateObj.format("HH:mm");

  return { date, time };
}
// Define los tipos de las props para el componente Text
interface TextProps {
  children: React.ReactNode; // Puede ser cualquier nodo de React (texto, componentes, etc.)
}

// Componente Text que muestra un párrafo con estilos
const Text: React.FC<TextProps> = ({ children }) => {
  return <p className={styles.selectTitle}>{children}</p>;
};

// Define los tipos de las props para el componente Li
interface LiProps {
  children: React.ReactNode; // Puede ser cualquier nodo de React (texto, componentes, etc.)
}

// Componente Li que muestra un elemento de lista con estilos personalizados
const Li: React.FC<LiProps> = ({ children }) => {
  return <li className={styles.customBullet}>{children}</li>;
};

export function generateEditConfirmationMessage(
  tripType: string | null,
  original: { origin: LocationDetails; destination: LocationDetails },
  updated: { origin: LocationDetails; destination: LocationDetails }
): React.ReactNode {
  const originalDeparture = extractDateAndTime(original.origin.dateTime);
  const originalArrival = extractDateAndTime(original.destination.dateTime);
  const newDeparture = extractDateAndTime(updated.origin.dateTime);
  const newArrival = extractDateAndTime(updated.destination.dateTime);
  return (
    <>
      <Text>
        Estas confirmando la edición de un trayecto de tipo <strong>{tripType}</strong>
      </Text>
      <br />
      <Text>Original:</Text>
      <ul>
        <Li>
          Origen: <strong>{original.origin.location}</strong> ({originalDeparture.date} -{" "}
          {originalDeparture.time})
        </Li>
        <Li>
          Destino: <strong>{original.destination.location}</strong> ({originalArrival.date} -{" "}
          {originalArrival.time})
        </Li>
      </ul>
      <br />
      <Text>Nuevo:</Text>
      <ul>
        <Li>
          Origen: <strong>{updated.origin.location}</strong> ({newDeparture.date} -{" "}
          {newDeparture.time})
        </Li>
        <Li>
          Destino: <strong>{updated.destination.location}</strong> ({newArrival.date} -{" "}
          {newArrival.time})
        </Li>
      </ul>
    </>
  );
}

export function generateDeleteConfirmationMessage(
  tripType: string | null,
  original: { origin: LocationDetails; destination: LocationDetails }
): React.ReactNode {
  return (
    <Text>
      Estas confirmando la eliminación del trayecto tipo <strong>{tripType}</strong> con origen en{" "}
      <strong>{original.origin.location}</strong> y destino en{" "}
      <strong>{original.destination.location}</strong>.
    </Text>
  );
}
