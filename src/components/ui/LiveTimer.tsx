import { useState, useEffect } from 'react';
import { formatDuration } from '../../lib/formatters';

interface LiveTimerProps {
  since: string;
}

export default function LiveTimer({ since }: LiveTimerProps) {
  const [display, setDisplay] = useState(() => formatDuration(since));

  useEffect(() => {
    setDisplay(formatDuration(since));
    const interval = setInterval(() => {
      setDisplay(formatDuration(since));
    }, 1000);
    return () => clearInterval(interval);
  }, [since]);

  return (
    <span className="font-mono text-sm text-text-muted">{display}</span>
  );
}
