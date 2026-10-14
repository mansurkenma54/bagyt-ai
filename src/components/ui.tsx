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
        <small>БИЗНЕС КӨМЕКШІСІ</small>
      </span>
    </div>
  );
}
export function Robot({
  size = 72,
  state = "greeting",
  onClick,
  label,
}: {
  size?: number;
  state?: string;
  onClick?: () => void;
  label?: string;
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
      aria-label={
        label ||
        `AQYL: ${names[emotion]}. Нажмите, чтобы сменить настроение / Көңіл күйін өзгерту`
      }
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={() => {
        onClick?.();
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
          cx="59"
          cy="110"
          rx="35"
          ry="3"
          fill="#00d89022"
        />
        <g className="aqyl-soul">
          <path d="M57 19h5v19h-5z" fill="#05c880" />
          <path
            className="aqyl-heart"
            d="M49 9h8v4h5V9h8v4h4v9h-4v4h-5v4h-5v4h-5v-4h-5v-4h-5v-4h-4v-9h4V9z"
            fill="#28f5a4"
          />
          <path d="M49 13h6v4h-6z" fill="#bdffe0" />
          <path
            d="M30 35h60v5h10v10h5v38h-5v10H83v11H71V98H30v-5H20V83h-5V50h5V40h10Z"
            fill="#008d59"
          />
          <path d="M30 35h60v5h10v10H20V40h10Z" fill="#9bffd1" />
          <path d="M26 43h68v7h6v34h-6v9H28v-6h-7V51h5Z" fill="#19df91" />
          <path d="M31 49h56v5h7v25h-7v8H31v-6h-5V55h5Z" fill="#031e15" />
          <path d="M6 56h9v23H6zM105 56h9v23h-9z" fill="#3bf4ae" />
          <path d="M10 61h5v13h-5zM105 61h5v13h-5z" fill="#00ad70" />
          <g className="soul-eyes soul-normal" fill="#42ffc0">
            <path d="M38 60h8v11h-8zM73 60h8v11h-8z" />
            <path d="M39 61h3v3h-3zM74 61h3v3h-3z" fill="#d9fff0" />
          </g>
          <g className="soul-eyes soul-happy" stroke="#42ffc0" strokeWidth="4">
            <path d="M36 68v-5h4v-3h5v3h4v5M70 68v-5h4v-3h5v3h4v5" />
          </g>
          <g className="soul-eyes soul-curious" fill="#42ffc0">
            <path d="M36 63h12v4H36zM73 57h8v13h-8zM36 55h12v3H36z" />
          </g>
          <g className="soul-eyes soul-sleepy" stroke="#26da98" strokeWidth="3">
            <path d="M36 68h14m19 0h14" />
          </g>
          <g className="soul-eyes soul-thinking" fill="#42ffc0">
            <path d="M42 58h7v10h-7zM77 58h7v10h-7z" />
          </g>
          <path
            className="soul-smile"
            d="M52 74v4h13v-4"
            stroke="#3fffb7"
            strokeWidth="3"
          />
          <path d="M33 74h7v3h-7zM79 74h7v3h-7z" fill="#077448" />
          <path d="M76 93h13v5h-7v6h-6Z" fill="#19df91" />
        </g>
        <g className="soul-thought" fill="#18d993">
          <rect x="91" y="20" width="4" height="4" />
          <rect x="100" y="15" width="5" height="5" />
          <rect x="110" y="9" width="6" height="6" />
        </g>
        <path
          className="soul-spark"
          d="M10 26h4v-5h4v5h5v4h-5v5h-4v-5h-4Z"
          fill="#61ffc2"
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
