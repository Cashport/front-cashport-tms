"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { message } from "antd";
import { Paperclip, X } from "phosphor-react";
import { FOLLOW_UP_OUTCOMES, TMS_STATES, toTMS } from "../../lib/rules";
import { useVehicleTowerStore } from "../../store/useVehicleTowerStore";
import type { IFleetItem, IVehicleTowerFollowUpFile } from "../../types/vehicleTower";
import { fileExt, kb } from "./followUpModel";
import styles from "./FollowUp.module.scss";

export interface IFollowUpFormProps {
  item: IFleetItem;
}

export function FollowUpForm({ item }: IFollowUpFormProps) {
  const { trip, evaluation } = item;
  const addFollowUp = useVehicleTowerStore((s) => s.addFollowUp);
  const [api, holder] = message.useMessage();
  const uid = useId();
  const [outcome, setOutcome] = useState("");
  const [pickedStatus, setPickedStatus] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<IVehicleTowerFollowUpFile[]>([]);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const prevOutcome = useRef("");
  const pending = useRef<IVehicleTowerFollowUpFile[]>([]);
  pending.current = files;

  const status = pickedStatus ?? toTMS(evaluation.state);
  const canSave = !!outcome && !!note.trim();

  useEffect(() => {
    if (outcome && !prevOutcome.current) noteRef.current?.focus();
    prevOutcome.current = outcome;
  }, [outcome]);

  useEffect(
    () => () => {
      pending.current.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    },
    []
  );

  const onPick = (ev: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(ev.target.files ?? []).map((f) => ({
      name: f.name,
      sizeBytes: f.size,
      url: URL.createObjectURL(f)
    }));
    ev.target.value = "";
    setFiles((prev) => prev.concat(picked));
  };

  const removeFile = (index: number) => {
    const gone = files[index];
    if (gone?.url) URL.revokeObjectURL(gone.url);
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!canSave) return;
    const entry = addFollowUp(trip.tripId, {
      outcome,
      reportedStatus: status,
      description: note,
      files
    });
    // Los adjuntos pasan a la bitácora: sus URLs siguen vivas mientras dure la sesión.
    pending.current = [];
    setFiles([]);
    setOutcome("");
    setPickedStatus(null);
    setNote("");
    if (entry.contacted) api.success("Seguimiento registrado");
    else api.info("Seguimiento registrado: no contactado, no cuenta para la alerta");
  };

  return (
    <section className={styles.sec} aria-labelledby={`${uid}-h`}>
      {holder}
      <div className={styles.secHead}>
        <h3 id={`${uid}-h`} className={styles.secTitle}>
          Registrar seguimiento
        </h3>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label className={styles.fl} htmlFor={`${uid}-res`}>
          Resultado de la gestión
        </label>
        <select
          id={`${uid}-res`}
          className={styles.select}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecciona el resultado
          </option>
          {FOLLOW_UP_OUTCOMES.map(([text]) => (
            <option key={text} value={text}>
              {text}
            </option>
          ))}
        </select>
        <div className={styles.more} hidden={!outcome}>
          <label className={styles.fl} htmlFor={`${uid}-est`}>
            Estado del servicio en el TMS
          </label>
          <select
            id={`${uid}-est`}
            className={styles.select}
            value={status}
            onChange={(e) => setPickedStatus(e.target.value)}
          >
            {TMS_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className={styles.fl} htmlFor={`${uid}-note`}>
            Descripción
          </label>
          <textarea
            ref={noteRef}
            id={`${uid}-note`}
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Qué dijo el conductor: ubicación, novedad, nueva hora de salida…"
          />
          <div className={styles.att}>
            <label className={styles.btn} htmlFor={`${uid}-files`}>
              <Paperclip size={13} weight="bold" aria-hidden />
              Adjuntar
            </label>
            <input
              id={`${uid}-files`}
              className={styles.srOnly}
              type="file"
              multiple
              onChange={onPick}
            />
            <span className={styles.sub}>Foto, PDF o audio de la llamada</span>
          </div>
          <ul className={styles.files}>
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className={styles.fchip}>
                <b>{fileExt(f.name)}</b>
                <a
                  className={styles.fn}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Abrir ${f.name}`}
                >
                  {f.name}
                </a>
                <span className={styles.fs}>{kb(f.sizeBytes)}</span>
                <button type="button" onClick={() => removeFile(i)} aria-label={`Quitar ${f.name}`}>
                  <X size={12} weight="bold" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button type="submit" className={`${styles.btn} ${styles.pri}`} disabled={!canSave}>
            Guardar en la bitácora
          </button>
        </div>
      </form>
    </section>
  );
}
