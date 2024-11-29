import styles from "./VehicleSuggestedTag.module.scss";
export default function VehicleSuggestedTag({
  vehicle_type_desc,
  units
}: {
  vehicle_type_desc: string;
  units: number;
}) {
  return (
    <div className={styles.vehiclesSubtitleInformation}>
      <p className={styles.vehiclesSubtitleInformationVehicle}>{vehicle_type_desc}</p>
      <label className={styles.vehiclesSubtitleInformationQuantity}>
        <p className={styles.vehiclesSubtitleInformationQuantityNumber}>
          {units.toString().padStart(2, "0")}
        </p>
      </label>
    </div>
  );
}
