import type { ReactNode } from "react";
import { CaretRight } from "phosphor-react";
import { docSumAt } from "../../lib/documents";
import { ago, cop, HR, toMs } from "../../lib/time";
import { driverName, gpsAgo, lastFollow } from "../../lib/tracking";
import type { IFleetItem, IVehicleTowerParams } from "../../types/vehicleTower";
import { tons } from "../Modals/TripItemsModal";
import { StopsBlock } from "./StopsBlock";
import styles from "./TripDrawer.module.scss";

interface ITripSectionProps {
  item: IFleetItem;
  t: number;
  now: number;
  params: IVehicleTowerParams;
  onOpenVehicle?: () => void;
  onOpenDriver?: () => void;
  onOpenItems?: () => void;
  onOpenObservations?: () => void;
}

const OBS_CLAMP_CHARS = 170;

function Row({
  label,
  onOpen,
  children
}: {
  label: string;
  onOpen?: () => void;
  children: ReactNode;
}) {
  if (!onOpen) {
    return (
      <div className={styles.trow} style={{ gridTemplateColumns: "72px minmax(0, 1fr)" }}>
        <span className={styles.k}>{label}</span>
        <span className={styles.trowV}>{children}</span>
      </div>
    );
  }
  return (
    <button type="button" className={`${styles.trow} ${styles.trowGo}`} onClick={onOpen}>
      <span className={styles.k}>{label}</span>
      <span className={styles.trowV}>{children}</span>
      <CaretRight size={12} className={styles.chev} aria-hidden />
    </button>
  );
}

function DocSummary({ earliest, now }: { earliest: string | null; now: number }) {
  if (!earliest) return null;
  const s = docSumAt(toMs(earliest), now);
  return <span className={`${styles.ds} ${styles[`ds_${s.status}`]}`}>{s.label}</span>;
}

export function TripSection({
  item,
  t,
  now,
  params,
  onOpenVehicle,
  onOpenDriver,
  onOpenItems,
  onOpenObservations
}: ITripSectionProps) {
  const { trip } = item;
  const tr = trip.transferRequest;
  if (!tr) return null;
  const personal = trip.vehicle.serviceType === "Personal";
  const items = personal ? trip.passengers : trip.materials;
  const first = personal ? trip.passengers[0]?.name : trip.materials[0]?.description;
  const long = tr.observations.length > OBS_CLAMP_CHARS;
  return (
    <section className={styles.sec} aria-labelledby="vt-dw-trip">
      <div className={styles.secHead}>
        <h3 id="vt-dw-trip" className={styles.secTitle}>
          TR y viaje
        </h3>
      </div>
      <div className={styles.trip}>
        <div className={styles.th}>
          <div className={styles.thMain}>
            <div className={styles.trid}>{tr.id}</div>
            <div className={styles.thSub}>
              <span className={styles.mono}>
                Trip {trip.tripId} · {trip.vehicle.serviceType}
              </span>{" "}
              · <span className={styles.smod}>{tr.fixedRate ? "Renta fija" : "Call out"}</span>
            </div>
          </div>
          {trip.cost && (
            <div className={styles.thCost}>
              <div className={styles.k}>Costo TR</div>
              <div className={`${styles.cost} ${styles.num}`}>{cop(trip.cost.amount)}</div>
              {trip.cost.pendingApproval > 0 && (
                <div className={`${styles.pend} ${styles.num}`}>
                  + {cop(trip.cost.pendingApproval)} por aprobar
                </div>
              )}
            </div>
          )}
        </div>
        <StopsBlock item={item} t={t} params={params} />
        {trip.client && (
          <Row label="Cliente">
            <span>{trip.client}</span>
          </Row>
        )}
        {trip.requester && (
          <Row label="Solicitante">
            <span className={styles.trowBlock}>
              {trip.requester.name}
              {trip.psl && <span className={`${styles.sub} ${styles.trowBlock}`}>{trip.psl}</span>}
            </span>
          </Row>
        )}
        <Row label="Proveedor">
          <span>{trip.carrier.name}</span>
        </Row>
        <Row label="Vehículo" onOpen={onOpenVehicle}>
          <span className={styles.plate}>{trip.vehicle.plate}</span>
          {trip.vehicle.trailerPlate && (
            <span className={styles.plate}>{trip.vehicle.trailerPlate}</span>
          )}
          <span className={styles.sub}>{trip.vehicle.type}</span>
          <DocSummary earliest={trip.documents.vehicleEarliestExpiration} now={now} />
        </Row>
        <Row label="Conductor" onOpen={onOpenDriver}>
          <span>{driverName(trip)}</span>
          <DocSummary earliest={trip.documents.driverEarliestExpiration} now={now} />
        </Row>
        {items.length > 0 && (
          <Row label={personal ? "Personal" : "Carga"} onOpen={onOpenItems}>
            <span>{first}</span>
            {items.length > 1 && <span className={styles.sub}>+{items.length - 1} más</span>}
            <span className={`${styles.sub} ${styles.num}`}>
              {personal
                ? `${items.length} pasajero${items.length > 1 ? "s" : ""}`
                : `${items.length} ítem${items.length > 1 ? "s" : ""} · ${tons(
                    trip.materials.reduce((m, x) => m + x.weightTons, 0)
                  )}`}
            </span>
          </Row>
        )}
        <div className={styles.obs}>
          <div className={styles.k}>Observaciones de la solicitud</div>
          <div className={`${styles.otx} ${long ? styles.clamp : ""}`}>{tr.observations}</div>
          {long && onOpenObservations && (
            <button type="button" className={styles.lnk2} onClick={onOpenObservations}>
              Ver completo
            </button>
          )}
        </div>
        <div className={`${styles.tfoot} ${styles.num}`}>
          <span>GPS {gpsAgo(trip, t)}</span>
          <span>Último seguimiento {ago((t - lastFollow(trip, t)) / HR)}</span>
        </div>
      </div>
    </section>
  );
}
