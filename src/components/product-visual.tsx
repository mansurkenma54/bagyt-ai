"use client";

import { useId } from "react";

export default function ProductVisual({
  sku,
  size = 64,
  label,
}: {
  sku: string;
  size?: number;
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const kind = sku.startsWith("COF")
    ? "coffee"
    : sku === "TEA-0100"
      ? "tea"
      : sku === "TEA-0200"
        ? "green"
        : sku === "SWT-0300"
          ? "chocolate"
          : sku === "SWT-0400"
            ? "cookie"
            : "gift";
  return (
    <span
      className={`product-visual product-${kind}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <defs>
          <linearGradient
            id={`${uid}-coffee`}
            x1="40"
            y1="35"
            x2="122"
            y2="135"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a56642" />
            <stop offset=".5" stopColor="#79482e" />
            <stop offset="1" stopColor="#4e2d1e" />
          </linearGradient>
          <linearGradient
            id={`${uid}-tea`}
            x1="42"
            y1="25"
            x2="117"
            y2="136"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={kind === "green" ? "#93b599" : "#4c7466"} />
            <stop
              offset="1"
              stopColor={kind === "green" ? "#426f58" : "#183d32"}
            />
          </linearGradient>
          <linearGradient
            id={`${uid}-paper`}
            x1="39"
            y1="32"
            x2="121"
            y2="136"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff0ce" />
            <stop offset="1" stopColor="#d1ad70" />
          </linearGradient>
          <linearGradient
            id={`${uid}-gift`}
            x1="37"
            y1="55"
            x2="125"
            y2="136"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#91c8b4" />
            <stop offset="1" stopColor="#427f69" />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="3"
          width="154"
          height="154"
          rx="24"
          fill="currentColor"
          opacity=".045"
        />
        <ellipse cx="82" cy="137" rx="47" ry="8" fill="#161e17" opacity=".13" />
        {kind === "coffee" && (
          <>
            <path
              d="M53 23h56l-4 16 13 87-10 10H47l-8-10 13-87z"
              fill={`url(#${uid}-coffee)`}
            />
            <path d="M53 23h56l-3 9H52z" fill="#4d3123" />
            <path d="M48 39h62" stroke="#d59a69" strokeWidth="2" opacity=".7" />
            <path
              d="m47 45-7 80 9 8 4-87M108 43l9 81-8 10"
              stroke="#37231b"
              opacity=".3"
              strokeWidth="3"
            />
            <rect x="53" y="55" width="49" height="62" rx="2" fill="#f5e5c7" />
            <path d="M62 65h31M67 69h20" stroke="#9e7654" strokeWidth="2" />
            <ellipse
              cx="76"
              cy="88"
              rx="10"
              ry="14"
              transform="rotate(35 76 88)"
              fill="#5c3c2b"
            />
            <path
              d="M78 76c-10 8 5 13-7 24"
              stroke="#d8ba86"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M66 108h23" stroke="#96744d" strokeWidth="2" />
            <ellipse
              cx="122"
              cy="127"
              rx="7"
              ry="10"
              transform="rotate(30 122 127)"
              fill="#68442f"
            />
            <path d="m125 120-6 14" stroke="#d49c64" strokeWidth="1.5" />
            <ellipse
              cx="35"
              cy="133"
              rx="8"
              ry="5"
              transform="rotate(-25 35 133)"
              fill="#68442f"
            />
            <path d="m29 136 12-6" stroke="#d49c64" strokeWidth="1.5" />
          </>
        )}
        {(kind === "tea" || kind === "green") && (
          <>
            <rect
              x="47"
              y="33"
              width="68"
              height="100"
              rx="9"
              fill={`url(#${uid}-tea)`}
            />
            <ellipse
              cx="81"
              cy="34"
              rx="34"
              ry="8"
              fill={kind === "green" ? "#b5ceb7" : "#5d8975"}
            />
            <path
              d="M47 36v7c14 8 53 8 68 0v-7"
              fill={kind === "green" ? "#8ea98b" : "#315848"}
            />
            <rect x="54" y="55" width="54" height="60" rx="3" fill="#f5e9cf" />
            <path d="M67 65h28M71 69h20" stroke="#7c9270" strokeWidth="2" />
            <path
              d="M79 104V79"
              stroke="#436a3e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M79 91c-15-1-17-12-15-15 12 0 17 9 15 15M80 98c13-2 18-12 16-17-12 0-18 8-16 17"
              fill={kind === "green" ? "#6b9c53" : "#56724b"}
            />
            <path
              d="m78 88-9-8m12 15 10-9"
              stroke="#adc090"
              strokeWidth="1.5"
            />
            <path
              d="M117 129c7-10 15-13 20-10-1 10-8 15-20 10Z"
              fill="#688d50"
            />
            <path d="m117 130 14-8" stroke="#a5bd83" strokeWidth="1.5" />
          </>
        )}
        {kind === "chocolate" && (
          <>
            <path d="m50 24 61 10-15 105-62-10z" fill="#684652" />
            <path d="m49 25 62 9-5 30-61-9z" fill="#e3c399" />
            <path d="m45 55 61 9-1 10-61-9z" fill="#d4b491" />
            <path d="m56 32 44 7-3 16-44-7z" fill="#694333" />
            <path
              d="m71 34-3 16m18-13-3 15M54 40l44 7"
              stroke="#aa7955"
              strokeWidth="2"
            />
            <rect
              x="49"
              y="82"
              width="39"
              height="34"
              rx="2"
              transform="rotate(9 49 82)"
              fill="#f1e4ca"
            />
            <path d="m58 91 23 4m-25 4 17 3" stroke="#8e6a69" strokeWidth="2" />
            <path d="m100 110 24 3-2 18-24-3z" fill="#5c382a" />
            <path
              d="m111 111-2 18m-9-10 22 3"
              stroke="#a17050"
              strokeWidth="2"
            />
          </>
        )}
        {kind === "cookie" && (
          <>
            <path
              d="M50 28h59l-2 10 10 89-8 9H46l-8-8 11-90z"
              fill={`url(#${uid}-paper)`}
            />
            <path d="M50 28h59v10H49z" fill="#c09d65" />
            <path d="M49 44h59" stroke="#eddaac" strokeWidth="2" />
            <rect x="48" y="58" width="59" height="54" rx="4" fill="#f4e9d0" />
            <circle cx="78" cy="83" r="19" fill="#c39854" />
            <circle cx="78" cy="83" r="15" fill="#dfb977" />
            {[
              [-7, -5],
              [8, -7],
              [0, 4],
              [-8, 8],
              [8, 9],
            ].map(([x, y], i) => (
              <circle key={i} cx={78 + x} cy={83 + y} r="2" fill="#8c6840" />
            ))}
            <circle cx="122" cy="125" r="14" fill="#d7af6a" />
            <path
              d="m116 120 3 2m5 5 3-2m-11 5 3 1m6-11 1 2"
              stroke="#8b683d"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {kind === "gift" && (
          <>
            <path
              d="m34 67 48-17 47 18-2 55-46 16-46-17z"
              fill={`url(#${uid}-gift)`}
            />
            <path d="m81 86 48-18-2 55-46 16z" fill="#3e8068" />
            <path d="m31 63 50-18 51 19v16L81 99 31 80z" fill="#a8d6bf" />
            <path d="m81 82 51-18v16L81 99z" fill="#6ea88d" />
            <path d="m55 54 51 19v57l-13 5V78L42 60z" fill="#efcda0" />
            <path d="m111 55-50 19v58l-13-5V70l51-19z" fill="#f5dfb4" />
            <path
              d="M78 52c-34-3-28-34-9-17 7 6 10 17 10 17Zm2 0c34-2 29-33 10-16-7 6-10 16-10 16Z"
              stroke="#e3bd85"
              strokeWidth="7"
            />
            <circle cx="80" cy="53" r="6" fill="#f8e3bb" />
          </>
        )}
      </svg>
    </span>
  );
}
