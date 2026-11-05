"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Phone, WhatsappLogo } from "phosphor-react";
import type { IVehicleTowerTrip } from "../../types/vehicleTower";
import styles from "./TripDrawer.module.scss";

interface IContact {
  role: string;
  name: string;
  phone: string;
}

export function contactsOf(trip: IVehicleTowerTrip): IContact[] {
  const list: IContact[] = [
    {
      role: "Conductor",
      name: `${trip.driver.name} ${trip.driver.lastName}`,
      phone: trip.driver.phone
    },
    {
      role: `Despacho · ${trip.carrier.name}`,
      name: trip.carrier.contactName,
      phone: trip.carrier.phoneNumber
    }
  ];
  if (trip.transferRequest) {
    if (trip.requester) {
      list.push({
        role: trip.psl ? `Solicitante · ${trip.psl}` : "Solicitante",
        name: trip.requester.name,
        phone: trip.requester.phone
      });
    }
    list.push({
      role: "Analista responsable",
      name: trip.analyst.name,
      phone: trip.analyst.phone
    });
  }
  return list;
}

export function ContactRow({ role, name, phone }: IContact) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const digits = phone.replace(/\D/g, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* sin permiso de portapapeles: no hace nada */
    }
  };

  return (
    <div className={styles.ctRow}>
      <div className={styles.ctRole}>{role}</div>
      <div className={styles.ctName}>{name}</div>
      <span className={styles.ctPhone}>{phone}</span>
      <div className={styles.ctAct}>
        <button
          type="button"
          className={styles.ica}
          onClick={copy}
          aria-label={`Copiar número de ${name}`}
          title={copied ? "Copiado" : "Copiar número"}
        >
          {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
        </button>
        <a
          className={styles.ica}
          href={`tel:+57${digits}`}
          aria-label={`Llamar a ${name}`}
          title="Llamar"
        >
          <Phone size={14} />
        </a>
        <a
          className={`${styles.ica} ${styles.icaWa}`}
          href={`https://wa.me/57${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp a ${name}`}
          title="WhatsApp"
        >
          <WhatsappLogo size={14} />
        </a>
      </div>
    </div>
  );
}

export function ContactsSection({ trip }: { trip: IVehicleTowerTrip }) {
  return (
    <section className={styles.sec} aria-labelledby="vt-dw-contact">
      <div className={styles.secHead}>
        <h3 id="vt-dw-contact" className={styles.secTitle}>
          Contacto
        </h3>
      </div>
      <div className={styles.contact}>
        {contactsOf(trip).map((c) => (
          <ContactRow key={c.role} {...c} />
        ))}
      </div>
    </section>
  );
}
