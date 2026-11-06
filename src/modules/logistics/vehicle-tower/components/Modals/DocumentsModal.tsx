"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { CaretRight, Check, Copy, DownloadSimple, FileText } from "phosphor-react";
import type { MapThemeMode } from "@/theme/mapPalette";
import { docStatus } from "../../lib/documents";
import type { DocStatus } from "../../lib/documents";
import { HR, toMs } from "../../lib/time";
import type { IVehicleTowerDocument, IVehicleTowerTrip } from "../../types/vehicleTower";
import { VtModal } from "./VtModal";
import styles from "./Modals.module.scss";

const date = (iso: string) => dayjs(toMs(iso)).format("DD/MM/YYYY");

/** Días hasta el vencimiento (negativo = vencido), con el mismo redondeo que el resumen de la ficha. */
const daysTo = (doc: IVehicleTowerDocument, now: number) =>
  Math.floor((toMs(doc.expiresAt) - now) / HR / 24);

const STATUS_CLASS: Record<DocStatus, string> = {
  expired: styles.dsExpired,
  expiring: styles.dsExpiring,
  valid: styles.dsValid
};

const RANK: Record<DocStatus, number> = { expired: 0, expiring: 1, valid: 2 };

function DocRow({
  doc,
  now,
  onOpen
}: {
  doc: IVehicleTowerDocument;
  now: number;
  onOpen: () => void;
}) {
  const days = daysTo(doc, now);
  const status = docStatus((toMs(doc.expiresAt) - now) / HR);
  const text =
    status === "expired"
      ? `Vencido hace ${-days} d`
      : status === "expiring"
        ? `Vence en ${days} d`
        : "Vigente";
  return (
    <button type="button" className={styles.docr} onClick={onOpen}>
      <span className={styles.di}>
        <FileText size={13} />
      </span>
      <span className={styles.dn}>{doc.name}</span>
      <span className={styles.dv}>Vence {date(doc.expiresAt)}</span>
      <span className={`${styles.ds} ${STATUS_CLASS[status]}`}>{text}</span>
      <CaretRight size={10} className={styles.chev} aria-hidden />
    </button>
  );
}

function DocList({
  docs,
  now,
  filter,
  onFilter,
  onOpen
}: {
  docs: IVehicleTowerDocument[];
  now: number;
  filter: "all" | "nov";
  onFilter: (f: "all" | "nov") => void;
  onOpen: (doc: IVehicleTowerDocument) => void;
}) {
  const st = (d: IVehicleTowerDocument) => RANK[docStatus((toMs(d.expiresAt) - now) / HR)];
  const sorted = docs
    .slice()
    .sort((a, b) => st(a) - st(b) || toMs(a.expiresAt) - toMs(b.expiresAt));
  const c = [0, 0, 0];
  sorted.forEach((d) => c[st(d)]++);
  const nov = c[0] + c[1];
  const shown = filter === "nov" ? sorted.filter((d) => st(d) !== 2) : sorted;
  return (
    <>
      <div className={styles.dhead}>
        <h4 className={styles.h4}>Documentos · {docs.length}</h4>
        <span className={styles.dsum}>
          {c[0] > 0 && (
            <span className={`${styles.ds} ${styles.dsExpired}`}>
              {c[0]} vencido{c[0] > 1 ? "s" : ""}
            </span>
          )}
          {c[1] > 0 && (
            <span className={`${styles.ds} ${styles.dsExpiring}`}>{c[1]} por vencer</span>
          )}
          <span className={`${styles.ds} ${styles.dsValid}`}>{c[2]} vigentes</span>
        </span>
      </div>
      {nov > 0 && (
        <div className={styles.seg} role="group" aria-label="Filtrar documentos">
          <button
            type="button"
            aria-pressed={filter === "all"}
            className={filter === "all" ? styles.segOn : ""}
            onClick={() => onFilter("all")}
          >
            Todos
          </button>
          <button
            type="button"
            aria-pressed={filter === "nov"}
            className={filter === "nov" ? styles.segOn : ""}
            onClick={() => onFilter("nov")}
          >
            Con novedad · {nov}
          </button>
        </div>
      )}
      <div className={styles.docs}>
        {shown.map((d) => (
          <DocRow key={d.name} doc={d} now={now} onOpen={() => onOpen(d)} />
        ))}
      </div>
    </>
  );
}

function DocDetail({
  doc,
  holder,
  now
}: {
  doc: IVehicleTowerDocument;
  holder: string;
  now: number;
}) {
  const days = daysTo(doc, now);
  const status = docStatus((toMs(doc.expiresAt) - now) / HR);
  const file = `${doc.name.toLowerCase().replace(/ /g, "_")}_${holder.replace(/ /g, "").toLowerCase()}.pdf`;
  return (
    <div className={styles.docview}>
      <div className={styles.paper}>
        <div className={styles.ph}>
          <b>{doc.name.toUpperCase()}</b>
          <span className={styles.mono}>N.º {doc.number}</span>
        </div>
        <div className={styles.pkv}>
          <span>Titular</span>
          <b>{holder}</b>
          <span>Entidad</span>
          <b>{doc.issuer}</b>
          <span>Vigente desde</span>
          <b className={styles.num}>{date(doc.issuedAt)}</b>
          <span>Vigente hasta</span>
          <b className={styles.num}>{date(doc.expiresAt)}</b>
        </div>
        <div className={styles.plines}>
          <i />
          <i />
          <i style={{ width: "70%" }} />
          <i />
          <i style={{ width: "55%" }} />
        </div>
      </div>
      <div className={styles.docmeta}>
        <span className={`${styles.ds} ${STATUS_CLASS[status]}`}>
          {status === "expired"
            ? `Vencido hace ${-days} días`
            : status === "expiring"
              ? `Vence en ${days} días`
              : "Vigente"}
        </span>
        <span className={styles.sub}>{file} · 284 KB</span>
      </div>
    </div>
  );
}

interface IDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  mode: MapThemeMode;
  now: number;
  title: ReactNode;
  cells: Array<{ k: string; v: ReactNode }>;
  docs: IVehicleTowerDocument[];
  holder: string;
}

function DocumentsModal({
  open,
  onClose,
  mode,
  now,
  title,
  cells,
  docs,
  holder
}: IDocumentsModalProps) {
  const [doc, setDoc] = useState<IVehicleTowerDocument | null>(null);
  const [filter, setFilter] = useState<"all" | "nov">("all");
  const [msg, msgCtx] = message.useMessage();
  return (
    <VtModal
      open={open}
      onClose={onClose}
      mode={mode}
      title={doc ? doc.name : title}
      onBack={doc ? () => setDoc(null) : undefined}
      extra={
        doc ? (
          <button
            type="button"
            className={styles.dl}
            aria-label={`Descargar ${doc.name}`}
            title="Descargar"
            onClick={() => msg.info(`Descargando ${doc.name}`)}
          >
            <DownloadSimple size={13} weight="bold" />
            Descargar
          </button>
        ) : undefined
      }
    >
      {msgCtx}
      {doc ? (
        <DocDetail doc={doc} holder={holder} now={now} />
      ) : (
        <>
          <div className={styles.mkv}>
            {cells.map((c) => (
              <div key={c.k}>
                <div className={styles.k}>{c.k}</div>
                <div className={styles.v}>{c.v}</div>
              </div>
            ))}
          </div>
          <DocList docs={docs} now={now} filter={filter} onFilter={setFilter} onOpen={setDoc} />
        </>
      )}
    </VtModal>
  );
}

interface IPartyModalProps {
  open: boolean;
  onClose: () => void;
  mode: MapThemeMode;
  trip: IVehicleTowerTrip;
  now: number;
}

export function VehicleModal({ open, onClose, mode, trip, now }: IPartyModalProps) {
  const v = trip.vehicle;
  return (
    <DocumentsModal
      open={open}
      onClose={onClose}
      mode={mode}
      now={now}
      title={
        <>
          Vehículo <span className={styles.plate}>{v.plate}</span>
        </>
      }
      holder={v.plate}
      docs={trip.documents.vehicle}
      cells={[
        { k: "Tipo", v: v.type },
        { k: "Marca y modelo", v: `${v.brand} ${v.line} · ${v.year}` },
        { k: "Matrícula", v: v.municipality.charAt(0) + v.municipality.slice(1).toLowerCase() },
        {
          k: "Remolque",
          v: v.trailerPlate ? <span className={styles.plate}>{v.trailerPlate}</span> : "No aplica"
        },
        { k: "Capacidad", v: v.capacity },
        { k: "Proveedor", v: trip.carrier.name },
        { k: "GPS", v: `${v.gpsProvider} · reporte cada 5 min` },
        { k: "Regional", v: trip.vp }
      ]}
    />
  );
}

function CopyPhone({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(phone.replace(/\s+/g, ""));
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* sin permiso de portapapeles: no hace nada */
    }
  };
  return (
    <button
      type="button"
      className={styles.cpy}
      onClick={copy}
      aria-label="Copiar número"
      title={copied ? "Copiado" : "Copiar número"}
    >
      {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
    </button>
  );
}

export function DriverModal({ open, onClose, mode, trip, now }: IPartyModalProps) {
  const d = trip.driver;
  const name = `${d.name} ${d.lastName}`;
  return (
    <DocumentsModal
      open={open}
      onClose={onClose}
      mode={mode}
      now={now}
      title={name}
      holder={name}
      docs={trip.documents.driver}
      cells={[
        {
          k: "Celular",
          v: (
            <>
              <span className={styles.mono}>{d.phone}</span>
              <CopyPhone phone={d.phone} />
            </>
          )
        },
        { k: "Empresa", v: trip.carrier.name },
        { k: "Categoría de licencia", v: d.licenseCategory },
        {
          k: "Servicios con Halliburton",
          v: `${d.servicesThisYear} en ${new Date(now).getFullYear()}`
        }
      ]}
    />
  );
}
