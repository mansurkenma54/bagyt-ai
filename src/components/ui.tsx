"use client";
import { useEffect, useRef } from "react";
import { X, ArrowUpRight, ArrowDownRight, Compass } from "lucide-react";
export function Logo() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <img src="/brand-mark.svg" width={38} height={38} alt="" />
      </span>
      <b>
        BAGYT<span> AI</span>
      </b>
    </div>
  );
}
export function Robot({
  size = 72,
  state = "greeting",
}: {
  size?: number;
  state?: string;
}) {
  return (
    <div className={`robot ${state}`} style={{ width: size, height: size }}>
      <img
        src="/aqyl.svg"
        alt={`AQYL · ${state}`}
        width={size}
        height={size}
      />
    </div>
  );
}
export function Badge({
  children,
  color = "green",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return <span className={`badge ${color}`}>{children}</span>;
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty">
      <Compass size={28} />
      <p>{children}</p>
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a,input,select,textarea,[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = old;
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"modal " + (wide ? "wide" : "")}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Закрыть / Жабу"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
        <span className={color || ""}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">
        {trend && (
          <span
            className={
              trend.startsWith("-") ? "positive amber-text" : "positive"
            }
          >
            {trend.startsWith("-") ? (
              <ArrowDownRight size={13} />
            ) : (
              <ArrowUpRight size={13} />
            )}
            {trend}
          </span>
        )}
        {detail}
      </div>
    </div>
  );
}
export function download(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export async function api(path: string, body?: unknown) {
  const r = await fetch("/api/" + path, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body instanceof FormData
        ? {}
        : body === undefined
          ? {}
          : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) {
    const e = new Error(data.error || "Ошибка запроса") as Error & {
      rows?: unknown;
    };
    e.rows = data.errors;
    throw e;
  }
  return data;
}
