"use client";
import { useEffect, useRef, useState } from "react";
import { X, ArrowUpRight, ArrowDownRight, Compass } from "lucide-react";
export function Logo() {
  return (
    <div className="brand bagyt-brand">
      <span className="brand-icon" aria-hidden="true">
        <svg className="bagyt-mark" viewBox="0 0 64 64" fill="currentColor">
          <g transform="translate(6 4) scale(.32)">
            <path d="M0 0H62C95 0 116 24 116 53C116 66 111 77 102 84H117C143 84 160 102 160 125C160 154 139 174 107 174H0L48 142H81C98 142 109 133 109 120C109 107 98 98 81 98H72L48 76H61C74 76 81 68 81 58C81 47 74 39 61 39H0V0Z" />
            <path d="M0 59L72 110L0 161V59Z" />
          </g>
        </svg>
      </span>
      <span className="brand-word">
        <b>Bagyt</b>
        <small>Bizneske anyq baǵyt</small>
      </span>
    </div>
  );
}
export { default as Robot } from "./belgi-robot";
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
        if (
          !ref.current?.contains(document.activeElement) ||
          document.activeElement === ref.current
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && document.activeElement === first) {
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
