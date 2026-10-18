// Iconos de trazo del prototipo (24×24, stroke 1.8)
export default function Icon({ name, className = 'size-5', children }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children ?? ICONS[name]}
    </svg>
  );
}

const ICONS = {
  pos: <path d="M4 3h16v5H4zM5 8v13h14V8M8 12h3M8 16h8" />,
  inventory: (
    <>
      <path d="m21 8-9 5-9-5 9-5 9 5Z" />
      <path d="m3 8 9 5 9-5M3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M17 14h.01M12 9v6M10 11h3a1 1 0 0 1 0 2h-3" />
    </>
  ),
  reports: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  bag: <path d="M7 7h10l1 13H6L7 7ZM9 7V5a3 3 0 0 1 6 0v2" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 4 4L19 6" />,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />,
  edit: <path d="m4 16-1 5 5-1L19 9l-4-4L4 16ZM13 7l4 4" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  alert: (
    <>
      <path d="M12 8v4M12 16h.01" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  trend: <path d="m4 16 6-6 4 4 6-8" />,
  download: <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />,
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
};
