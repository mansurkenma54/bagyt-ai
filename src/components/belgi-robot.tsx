"use client";
import type { CSSProperties, PointerEvent } from "react";

export type AgentVariant = "belgi" | "sana" | "qor";
export type BelgiRobotProps = {
  size?: number;
  state?: string;
  onClick?: () => void;
  label?: string;
  variant?: AgentVariant;
};

const names: Record<AgentVariant, string> = {
  belgi: "Belgi",
  sana: "Sana",
  qor: "Qor",
};

const geometry = {
  belgi: {
    eyes: "radial-gradient(ellipse 7% 10% at 45.5% 68.5%, #000 80%, transparent 100%), radial-gradient(ellipse 7% 10% at 67.5% 68.5%, #000 80%, transparent 100%)",
    blinkX: "1%",
    blinkY: "0%",
    mouth:
      "radial-gradient(ellipse 7% 5% at 56% 77%, #000 75%, transparent 100%)",
    mouthX: "0%",
    mouthY: "2%",
  },
  sana: {
    eyes: "radial-gradient(ellipse 12% 12% at 38.5% 33.5%, #000 84%, transparent 100%), radial-gradient(ellipse 12% 12% at 71% 33.5%, #000 84%, transparent 100%)",
    blinkX: "8.2%",
    blinkY: "-1.2%",
    mouth:
      "radial-gradient(ellipse 9% 6% at 54% 62%, #000 75%, transparent 100%)",
    mouthX: "5.5%",
    mouthY: "10%",
  },
  qor: {
    eyes: "radial-gradient(ellipse 8.5% 9.5% at 42% 59%, #000 80%, transparent 100%), radial-gradient(ellipse 8.5% 9.5% at 67% 59%, #000 80%, transparent 100%)",
    blinkX: "5.2%",
    blinkY: "-1%",
    mouth:
      "radial-gradient(ellipse 8% 6% at 54.5% 70.5%, #000 75%, transparent 100%)",
    mouthX: "4.5%",
    mouthY: "10%",
  },
};

/** The silhouette never changes frame. Blinks and speech replace only masked facial regions. */
export default function BelgiRobot({
  size = 72,
  state = "greeting",
  onClick,
  label,
  variant = "belgi",
}: BelgiRobotProps) {
  const thinking = [
    "loading",
    "thinking",
    "processing",
    "working",
    "work",
  ].includes(state);
  const mood = thinking
    ? "thinking"
    : ["success", "happy", "celebrate", "joy"].includes(state)
      ? "happy"
      : ["risk", "error", "warning", "concerned"].includes(state)
        ? "concerned"
        : ["sleep", "sleeping"].includes(state)
          ? "sleeping"
          : ["speaking", "talking"].includes(state)
            ? "talking"
            : state === "curious"
              ? "curious"
              : state === "idle"
                ? "idle"
                : "greeting";
  const Character = onClick ? "button" : "span";
  const face = geometry[variant];
  const look = (event: PointerEvent<HTMLElement>) => {
    if (size < 64 || event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--look-x",
      `${((event.clientX - box.left) / box.width - 0.5) * 7}deg`,
    );
    event.currentTarget.style.setProperty(
      "--look-y",
      `${((event.clientY - box.top) / box.height - 0.5) * -5}deg`,
    );
  };
  return (
    <Character
      type={onClick ? "button" : undefined}
      role={onClick ? undefined : "img"}
      className={`robot belgi-robot agent-character agent-rendered agent-${variant} emotion-${mood}${thinking ? " is-thinking" : ""}`}
      style={
        {
          width: size,
          height: size,
          "--agent-image": `url(/agents3d/${variant}-head.webp)`,
          "--eye-mask": face.eyes,
          "--blink-x": face.blinkX,
          "--blink-y": face.blinkY,
          "--mouth-mask": face.mouth,
          "--mouth-x": face.mouthX,
          "--mouth-y": face.mouthY,
        } as CSSProperties
      }
      aria-label={label || names[variant]}
      onClick={onClick}
      onPointerMove={look}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--look-x", "0deg");
        event.currentTarget.style.setProperty("--look-y", "0deg");
      }}
      data-agent={variant}
      data-emotion={mood}
      data-state={state}
      data-compact={size < 64 ? "true" : undefined}
    >
      <span className="agent-render-shadow" aria-hidden="true" />
      <span className="agent-render-body" aria-hidden="true">
        <span className="agent-head-core">
          <span className="agent-head-base" />
          <span className="agent-head-eyes">
            <span className="agent-head-blink" />
          </span>
          <span className="agent-head-mouth">
            <span className="agent-head-speaking" />
          </span>
        </span>
      </span>
      {thinking && size >= 64 ? (
        <span className="agent-render-thoughts" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : null}
    </Character>
  );
}
