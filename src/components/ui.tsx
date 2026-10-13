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
        <small>БИЗНЕС БАҒЫТЫ</small>
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
      className={`robot pixel-robot mood-${emotion}`}
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
        viewBox="0 0 96 96"
        fill="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <ellipse
          className="pixel-shadow"
          cx="48"
          cy="84"
          rx="29"
          ry="3"
          fill="#04bf7530"
        />
        <g className="pixel-body">
          <path d="M46 27V15h4v12h-4Z" fill="#13e68c" />
          <path d="M42 7h12v12H42z" fill="#16e991" />
          <path d="M46 11h4v4h-4z" fill="#d2ffe9" />
          <path
            d="M26 23h4v4h8v7h-4v-3h-8v-8Zm40 0h4v8h-8v3h-4v-7h8v-4Z"
            fill="#00b570"
          />
          <path d="M18 15h12v12H18zM66 15h12v12H66z" fill="#16e991" />
          <path d="M22 19h4v4h-4zM70 19h4v4h-4z" fill="#c1ffdf" />
          <path
            d="M22 31h52v4h8v8h4v28h-4v8H14v-8h-4V43h4v-8h8v-4Z"
            fill="#009a5f"
          />
          <path d="M22 31h52v4h8v8H14v-8h8v-4Z" fill="#78ffbb" />
          <path d="M18 39h60v4h4v24h-4v8H18v-8h-4V43h4v-4Z" fill="#10de87" />
          <path d="M22 43h52v4h4v20h-4v4H22v-4h-4V47h4v-4Z" fill="#031d13" />
          <path d="M4 47h6v20H4zM86 47h6v20h-6z" fill="#20ef98" />
          <path d="M18 75h60v4H18zM26 79h44v3H26z" fill="#007c4b" />
          <g className="pixel-eyes eye-normal" fill="#1ef7a1">
            <path d="M29 51h8v8h-8zM59 51h8v8h-8z" />
          </g>
          <g className="pixel-eyes eye-happy" fill="#26ffa6">
            <path d="M27 55v-4h4v-4h8v4h4v4h-4v-4h-8v4h-4ZM55 55v-4h4v-4h8v4h4v4h-4v-4h-8v4h-4Z" />
          </g>
          <g className="pixel-eyes eye-curious" fill="#26ffa6">
            <path d="M27 53h12v4H27zM59 47h8v12h-8zM27 45h12v3H27z" />
          </g>
          <g className="pixel-eyes eye-sleepy" fill="#15de8b">
            <path d="M27 55h14v3H27zM55 55h14v3H55z" />
          </g>
          <g className="pixel-eyes eye-thinking" fill="#26ffa6">
            <path d="M31 51h8v8h-8zM61 51h8v8h-8z" />
          </g>
          <path
            className="pixel-mouth"
            d="M41 63h4v3h6v-3h4v3h-4v3h-6v-3h-4v-3Z"
            fill="#13e68c"
          />
          <path
            className="pixel-cheeks"
            d="M24 61h8v3h-8zM64 61h8v3h-8z"
            fill="#09a364"
          />
        </g>
        <g className="thought-pixels" fill="#08d980">
          <rect x="71" y="4" width="4" height="4" />
          <rect x="79" y="4" width="4" height="4" />
          <rect x="87" y="4" width="4" height="4" />
        </g>
        <g className="sleep-pixels" fill="#00b975">
          <path d="M79 25h9v3h-3v3h-3v3h6v3h-9v-3h3v-3h3v-3h-6z" />
        </g>
        <g className="happy-spark" fill="#0bdd87">
          <path d="M4 30h4v-4h4v4h4v4h-4v4H8v-4H4z" />
        </g>
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
