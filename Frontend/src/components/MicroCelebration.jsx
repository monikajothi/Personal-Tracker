import React, { useEffect, useState } from "react";

const BURST_EMOJIS = ["✨", "🌸", "💗", "⭐", "🌿", "🩷"];

export default function MicroCelebration({ trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const batchId = trigger;
    const next = Array.from({ length: 8 }).map((_, i) => ({
      id: `${batchId}-${i}`,
      emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
      angle: (i / 8) * 360 + Math.random() * 20,
      distance: 55 + Math.random() * 35,
    }));
    setParticles(next);
    const timeout = setTimeout(() => setParticles([]), 850);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (!particles.length) return null;

  return (
    <div style={{ position: "fixed", top: "50%", left: "50%", zIndex: 200, pointerEvents: "none" }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute", fontSize: 20, top: 0, left: 0,
            animation: "mwt-burst 0.85s ease-out forwards",
            "--angle": `${p.angle}deg`,
            "--dist": `${p.distance}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}