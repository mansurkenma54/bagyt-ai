import { useId } from "react";
import Image from "next/image";

export default function ChannelIcon({
  source,
  size = 22,
}: {
  source: string;
  size?: number;
}) {
  const id = useId().replace(/:/g, "");
  const name = source.trim().toLowerCase();
  const whatsApp = name.includes("whatsapp"),
    instagram = name.includes("instagram"),
    tiktok = /tik[\s._-]*tok|тикток/.test(name);
  const gis = name.includes("2gis") || name.includes("2гис"),
    google = name.includes("google"),
    kaspi = /kaspi|каспи/.test(name);
  const spreadsheet = /excel|csv/.test(name),
    pos = name.includes("pos");
  const brandAsset = kaspi
    ? "/channels/kaspi.svg"
    : tiktok
      ? "/channels/tiktok.png"
      : null;
  return (
    <span
      className="channel-icon"
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
        verticalAlign: "middle",
      }}
      role="img"
      aria-label={source}
    >
      {brandAsset ? (
        <Image
          src={brandAsset}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          unoptimized
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: kaspi ? "50%" : "25%",
          }}
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          fill="none"
          aria-hidden="true"
        >
          {whatsApp ? (
            <>
              <rect width="32" height="32" rx="9" fill="#25D366" />
              <path
                d="M24.5 15.7a8.5 8.5 0 0 1-12.6 7.5L7 24.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z"
                stroke="white"
                strokeWidth="1.8"
              />
              <path
                d="m12.2 10.9 1.8 3-1.1 1.3c.9 1.8 2.1 3 3.9 3.8l1.3-1.2 3 1.7c-.3 1.7-1.4 2.2-3 1.7-4.2-1.3-7.2-4.4-8.2-8.2-.3-1.2.5-2 2.3-2.1Z"
                fill="white"
              />
            </>
          ) : instagram ? (
            <>
              <defs>
                <linearGradient
                  id={`${id}-instagram`}
                  x1="3"
                  y1="31"
                  x2="26"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFC35C" />
                  <stop offset=".43" stopColor="#E43D69" />
                  <stop offset="1" stopColor="#8C3CCB" />
                </linearGradient>
              </defs>
              <rect
                width="32"
                height="32"
                rx="9"
                fill={`url(#${id}-instagram)`}
              />
              <rect
                x="7.5"
                y="7.5"
                width="17"
                height="17"
                rx="5"
                stroke="white"
                strokeWidth="2"
              />
              <circle cx="16" cy="16" r="4.3" stroke="white" strokeWidth="2" />
              <circle cx="21.7" cy="10.7" r="1.3" fill="white" />
            </>
          ) : gis ? (
            <>
              <rect width="32" height="32" rx="9" fill="#73B928" />
              <path
                d="M16 5a8 8 0 0 0-8 8c0 6.4 8 14 8 14s8-7.6 8-14a8 8 0 0 0-8-8Z"
                fill="white"
              />
              <circle cx="16" cy="13" r="4.5" fill="#73B928" />
              <path d="M6 17h20v3H6z" fill="#73B928" />
            </>
          ) : google ? (
            <>
              <rect
                x=".5"
                y=".5"
                width="31"
                height="31"
                rx="8.5"
                fill="white"
                stroke="#E5E7EB"
              />
              <path
                d="M25.5 16.2c0-.7-.1-1.3-.2-2H16v4h5.3a4.4 4.4 0 0 1-2 3v2.6h3.3c1.9-1.7 2.9-4.3 2.9-7.6Z"
                fill="#4285F4"
              />
              <path
                d="M16 26c2.7 0 5-1 6.6-2.2l-3.3-2.6c-.9.6-2 .9-3.3.9-2.6 0-4.8-1.8-5.6-4.1H7v2.7A10 10 0 0 0 16 26Z"
                fill="#34A853"
              />
              <path
                d="M10.4 18a6 6 0 0 1 0-4V11H7a10 10 0 0 0 0 9.7l3.4-2.7Z"
                fill="#FBBC05"
              />
              <path
                d="M16 10c1.5 0 2.8.5 3.9 1.5l3-3A10 10 0 0 0 7 11l3.4 3c.8-2.3 3-4 5.6-4Z"
                fill="#EA4335"
              />
            </>
          ) : spreadsheet ? (
            <>
              <rect width="32" height="32" rx="9" fill="#168352" />
              <path
                d="M19 8h6v16h-6M19 13h6M19 19h6M22 8v16"
                stroke="white"
                strokeWidth="1.5"
                opacity=".7"
              />
              <path d="m7 10 9 12m0-12L7 22" stroke="white" strokeWidth="2.8" />
            </>
          ) : pos ? (
            <>
              <rect width="32" height="32" rx="9" fill="#64748B" />
              <rect
                x="8"
                y="5"
                width="16"
                height="23"
                rx="3"
                stroke="white"
                strokeWidth="1.7"
              />
              <path d="M12 9h8v5h-8z" fill="white" />
              <path
                d="M12 19h1m6 0h1m-8 4h1m6 0h1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <rect width="32" height="32" rx="9" fill="#4179E8" />
              <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="1.6" />
              <ellipse
                cx="16"
                cy="16"
                rx="4"
                ry="9"
                stroke="white"
                strokeWidth="1.6"
              />
              <path
                d="M7 16h18M9 11h14M9 21h14"
                stroke="white"
                strokeWidth="1.3"
              />
            </>
          )}
        </svg>
      )}
    </span>
  );
}
