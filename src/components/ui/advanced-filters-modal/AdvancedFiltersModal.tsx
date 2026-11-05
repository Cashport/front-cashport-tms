"use client";
import { useEffect, useMemo, useState } from "react";
import { Modal, theme } from "antd";
import type { CSSProperties } from "react";
import { Funnel, MagnifyingGlass, X } from "phosphor-react";
import styles from "./AdvancedFiltersModal.module.scss";

export interface IAdvancedFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface IAdvancedFilterCategory {
  id: string;
  name: string;
  options: IAdvancedFilterOption[];
}

export type AdvancedFilterValues = Record<string, string[]>;

export interface IAdvancedFiltersModalProps {
  open: boolean;
  categories: IAdvancedFilterCategory[];
  value: AdvancedFilterValues;
  onApply: (next: AdvancedFilterValues) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  applyLabel?: string;
}

function readableInk(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#fff";
  const n = parseInt(m[1], 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#141414" : "#fff";
}

const empty = (categories: IAdvancedFilterCategory[]): AdvancedFilterValues =>
  Object.fromEntries(categories.map((c) => [c.id, []]));

export function AdvancedFiltersModal({
  open,
  categories,
  value,
  onApply,
  onClose,
  title = "Filtros Avanzados",
  subtitle = "Encuentra y selecciona múltiples opciones",
  applyLabel = "Aplicar Filtros"
}: IAdvancedFiltersModalProps) {
  const { token } = theme.useToken();
  const [draft, setDraft] = useState<AdvancedFilterValues>({});
  const [activeId, setActiveId] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraft(Object.fromEntries(categories.map((c) => [c.id, [...(value[c.id] ?? [])]])));
    setActiveId(categories[0]?.id ?? "");
    setQuery("");
    // Solo al abrir: los cambios de props con el modal abierto no pisan lo que el usuario está editando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const selected = (active && draft[active.id]) || [];
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active ? active.options.filter((o) => !q || o.label.toLowerCase().includes(q)) : [];
  }, [active, query]);
  const allOn = visible.length > 0 && visible.every((o) => selected.includes(o.value));

  const setActiveValues = (values: string[]) =>
    active && setDraft((d) => ({ ...d, [active.id]: values }));

  const toggle = (v: string) =>
    setActiveValues(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const toggleAll = () => {
    const vals = visible.map((o) => o.value);
    setActiveValues(
      allOn
        ? selected.filter((x) => !vals.includes(x))
        : Array.from(new Set([...selected, ...vals]))
    );
  };

  const vars = {
    "--afm-bg": token.colorBgElevated,
    "--afm-ink": token.colorText,
    "--afm-accent": token.colorPrimary,
    "--afm-accent-ink": readableInk(token.colorPrimary),
    "--afm-accent-soft": token.colorPrimaryBg,
    "--afm-pill": token.colorText,
    "--afm-pill-ink": token.colorBgElevated
  } as CSSProperties;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      destroyOnClose
      width={900}
      title={null}
      styles={{ content: { padding: 0, overflow: "hidden", background: token.colorBgElevated } }}
    >
      <div className={styles.root} style={vars}>
        <div className={styles.head}>
          <div className={styles.ico} aria-hidden>
            <Funnel size={15} weight="fill" />
          </div>
          <div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.cats} role="tablist" aria-orientation="vertical">
            {categories.map((c) => {
              const n = draft[c.id]?.length ?? 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={c.id === active?.id}
                  className={`${styles.cat} ${c.id === active?.id ? styles.catOn : ""}`}
                  onClick={() => {
                    setActiveId(c.id);
                    setQuery("");
                  }}
                >
                  {c.name}
                  {n > 0 && <span className={styles.badge}>{n}</span>}
                </button>
              );
            })}
          </div>
          <div className={styles.opts}>
            <label className={styles.search}>
              <MagnifyingGlass size={14} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Buscar en ${active?.name.toLowerCase() ?? ""}…`}
                autoComplete="off"
                aria-label={`Buscar en ${active?.name ?? "las opciones"}`}
              />
            </label>
            <div className={styles.res}>
              <span>{visible.length} resultados</span>
              <button type="button" onClick={toggleAll}>
                {allOn ? "Quitar todos" : "Seleccionar todos"}
              </button>
            </div>
            <div className={styles.list}>
              {visible.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    className={`${styles.opt} ${on ? styles.optOn : ""}`}
                    onClick={() => toggle(o.value)}
                  >
                    <span className={styles.box} aria-hidden />
                    <span className={styles.optLabel}>{o.label}</span>
                    {o.count !== undefined && <span className={styles.count}>{o.count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.foot}>
          <button type="button" className={styles.txt} onClick={() => setDraft(empty(categories))}>
            Limpiar todo
          </button>
          <span className={styles.spacer} />
          <button type="button" className={`${styles.txt} ${styles.txtInk}`} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={styles.apply} onClick={() => onApply(draft)}>
            {applyLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
