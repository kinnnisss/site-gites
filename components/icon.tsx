import type { ReactNode } from "react";

const drawings = {
  home: (
    <>
      <path d="m3 10 9-7 9 7M5 9v12h14V9" />
      <path d="M9 21v-8h6v8" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 3C8 2 2 8 5 15s15 5 15-12Z" />
      <path d="m3 21 12-12M8 16v-5m0 5h5" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18v3m18-3v3M3 18h18v-6H3zM5 12V5h14v7M8 12V9h8v3" />
    </>
  ),
  bath: (
    <>
      <path d="M3 12h18l-2 7H5zM6 12V5a2 2 0 0 1 4 0M6 19v2m12-2v2M9 7h3" />
    </>
  ),
  kitchen: (
    <>
      <path d="M5 3v7m3-7v7m3-7v7M5 7h6M8 10v11M18 21V3c-4 3-4 9 0 9" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h5l2-3h4l2 3h5v14H3z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5z" />
      <path d="m8 11 3 3 5-6" />
    </>
  ),
  water: (
    <>
      <path d="M3 16q3-3 6 0t6 0 6 0M3 21q3-3 6 0t6 0 6 0M8 12V5a2 2 0 0 1 4 0M16 12V5a2 2 0 0 1 4 0M8 8h8" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof drawings;
export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {drawings[name]}
    </svg>
  );
}
