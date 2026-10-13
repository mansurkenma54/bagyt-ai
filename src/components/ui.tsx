"use client";
import { useEffect, useRef, useState } from "react";
import { X, ArrowUpRight, ArrowDownRight, Compass } from "lucide-react";
export function Logo() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <img src="/brand-mark.svg" width={38} height={38} alt="" />
      </span>
      <span className="brand-word">
        <b>
          BAGYT<span> AI</span>
        </b>
        <small>ӨЗ ІСІҢЕ СЕН</small>
      </span>
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
  const [mood, setMood] = useState("idle");
  const [hover, setHover] = useState(false);
  const fixed =
    state === "loading" || state === "thinking"
      ? "thinking"
      : state === "success"
        ? "happy"
        : state === "risk" || state === "curious"
          ? "curious"
          : null;
  const emotion = fixed || (hover ? "happy" : mood);
  useEffect(() => {
    if (fixed) return;
    const timer = setInterval(
      () =>
        setMood((m) =>
          m === "idle" ? "curious" : m === "curious" ? "sleepy" : "idle",
        ),
      12000,
    );
    return () => clearInterval(timer);
  }, [fixed]);
  const names: Record<string, string> = {
    idle: "готов помочь / көмектесуге дайын",
    happy: "радуется / қуанып тұр",
    curious: "интересуется / қызығып тұр",
    thinking: "думает / ойланып тұр",
    sleepy: "отдыхает / демалып тұр",
  };
  return (
    <button
      type="button"
      className={`robot soul-robot mood-${emotion}`}
      style={{ width: size, height: size }}
      aria-label={`AQYL: ${names[emotion]}. Нажмите, чтобы сменить настроение / Көңіл күйін өзгерту`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={() => {
        setHover(false);
        setMood((m) =>
          m === "happy" ? "curious" : m === "curious" ? "sleepy" : "happy",
        );
      }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
        shapeRendering="crispEdges"
      >
        <ellipse
          className="aqyl-ground"
          cx="61"
          cy="108"
          rx="31"
          ry="4"
          fill="#163b3020"
        />
        <g className="aqyl-soul">
          {/* A little direction-star: four soft stepped points and a heart pocket. */}
          <path
            d="M50 14h20v10h10v13h13v10h13v24H94v11H81v16H69v8H50V95H38V82H25V70H13V48h13V37h13V24h11Z"
            fill="#123e35"
          />
          <path
            d="M51 18h17v11h10v14h14v9h10v16H90v11H77v16H66v7H53V91H41V78H28V67H17V51h13V41h13V29h8Z"
            fill="#88d9ae"
          />
          <path d="M51 18h17v11h10v10H45V29h6Z" fill="#c5f3d5" />
          <path d="M30 45h58v28H30Z" fill="#c5f3d5" />
          <g className="soul-eyes soul-normal" fill="#163b30">
            <path d="M40 49h6v10h-6zM72 49h6v10h-6z" />
            <path d="M42 49h2v3h-2zM74 49h2v3h-2z" fill="white" />
          </g>
          <g className="soul-eyes soul-happy" stroke="#163b30" strokeWidth="4">
            <path d="M37 56v-5h11v5M69 56v-5h11v5" />
          </g>
          <g className="soul-eyes soul-curious" fill="#163b30">
            <path d="M39 50h9v4h-9zM72 47h6v12h-6zM39 44h9v3h-9z" />
          </g>
          <g className="soul-eyes soul-sleepy" stroke="#163b30" strokeWidth="3">
            <path d="M38 55h12m18 0h12" />
          </g>
          <g className="soul-eyes soul-thinking" fill="#163b30">
            <path d="M43 47h6v9h-6zM75 47h6v9h-6z" />
          </g>
          <path
            className="soul-smile"
            d="M52 60v4h12v-4"
            stroke="#163b30"
            strokeWidth="3"
          />
          <path d="M33 60h8v4h-8zM78 60h8v4h-8z" fill="#e59f85" />
          <path
            d="M48 74h8v4h5v-4h8v4h4v8h-4v4h-4v4h-4v4h-5v-4h-4v-4h-4v-4h-4v-8h3Z"
            fill="#f17f6a"
          />
          <path d="M49 77h6v4h-6z" fill="#ffd1b7" />
          <path className="soul-hand" d="M88 72h9v-9h7v16H88Z" fill="#123e35" />
        </g>
        <g className="soul-thought" fill="#527365">
          <rect x="85" y="18" width="4" height="4" />
          <rect x="95" y="13" width="5" height="5" />
          <rect x="106" y="8" width="6" height="6" />
        </g>
        <path
          className="soul-spark"
          d="M17 17h4v6h6v4h-6v6h-4v-6h-6v-4h6z"
          fill="#e89965"
        />
      </svg>
    </button>
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
