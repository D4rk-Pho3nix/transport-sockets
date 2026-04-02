interface TruckSVGProps {
  colorHex: string;
  size?: number;
}

export default function TruckSVG({ colorHex, size = 40 }: TruckSVGProps) {
  const h = size * 0.5;
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 80 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trailer */}
      <rect x="0" y="6" width="48" height="24" rx="2" fill={colorHex} />
      {/* Cab */}
      <path
        d="M48 12 H66 Q72 12 74 18 L76 24 V30 H48 V12Z"
        fill="#2D3436"
      />
      {/* Windshield */}
      <path
        d="M56 14 H64 Q68 14 70 18 L72 22 H56 V14Z"
        fill="#636e72"
        opacity="0.6"
      />
      {/* Chassis */}
      <rect x="0" y="30" width="76" height="2" rx="1" fill="#2D3436" />
      {/* Rear wheels */}
      <circle cx="14" cy="34" r="5" fill="#1a1a1a" />
      <circle cx="14" cy="34" r="2.5" fill="#333" />
      <circle cx="28" cy="34" r="5" fill="#1a1a1a" />
      <circle cx="28" cy="34" r="2.5" fill="#333" />
      {/* Front wheel */}
      <circle cx="66" cy="34" r="5" fill="#1a1a1a" />
      <circle cx="66" cy="34" r="2.5" fill="#333" />
    </svg>
  );
}
