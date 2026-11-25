/** UIActivityIndicatorView: 8 fading spokes. */
export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin [animation-duration:0.8s] [animation-timing-function:steps(8)] ${className}`} aria-label="Loading">
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1="12"
          y1="3"
          x2="12"
          y2="7.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity={1 - i * 0.11}
          transform={`rotate(${-i * 45} 12 12)`}
        />
      ))}
    </svg>
  );
}
