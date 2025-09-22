import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export default function Butterflies({ count = 6 }) {
  const containerRef = useRef(null);

  // brighter palettes for night sky
  const palettes = [
    ["#4caf50", "#a5d6a7"], // bright leaf green
    ["#43a047", "#c8e6c9"], // light forest
    ["#26a69a", "#80cbc4"], // teal
    ["#8bc34a", "#dcedc8"], // lime-green
    ["#66bb6a", "#b9f6ca"], // spring
  ];

  // generate butterfly configs once
  const [butterflies] = useState(() =>
    Array.from({ length: count }).map(() => {
      const colors = gsap.utils.random(palettes, true);
      return {
        size: gsap.utils.random(24, 42),
        wingColor: colors[0],
        wingHighlight: colors[1],
        bodyColor: "#3e2723",
        flapSpeed: gsap.utils.random(0.25, 0.45),
        pattern: gsap.utils.random(["zigzag", "loop", "drift"]),
        start: {
          top: `${gsap.utils.random(15, 80)}%`,
          left: `${gsap.utils.random(15, 80)}%`,
        },
      };
    })
  );

  useEffect(() => {
    const nodes = containerRef.current.querySelectorAll(".butterfly");

    nodes.forEach((node, i) => {
      const wings = node.querySelectorAll(".wing");
      const config = butterflies[i];

      // wings flap
      gsap.to(wings, {
        scaleX: 0.6,
        duration: config.flapSpeed,
        yoyo: true,
        repeat: -1,
        transformOrigin: "center center",
        ease: "sine.inOut",
      });

      // body sway
      gsap.to(node, {
        rotation: gsap.utils.random(-10, 10),
        duration: gsap.utils.random(1.5, 3),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // flight
      const fly = () => {
        let path;
        switch (config.pattern) {
          case "zigzag":
            path = [
              { x: gsap.utils.random(-100, 100), y: gsap.utils.random(-50, 50) },
              { x: gsap.utils.random(-200, 200), y: gsap.utils.random(-100, 100) },
            ];
            break;
          case "loop":
            path = [
              { x: 0, y: 0 },
              { x: 80, y: -40 },
              { x: 0, y: -80 },
              { x: -80, y: -40 },
              { x: 0, y: 0 },
            ];
            break;
          default:
            path = [
              { x: gsap.utils.random(-150, 150), y: gsap.utils.random(-80, 80) },
            ];
        }

        gsap.to(node, {
          duration: gsap.utils.random(8, 14),
          motionPath: { path, curviness: 1.5 },
          ease: "power1.inOut",
          onComplete: fly,
        });
      };

      fly();
    });
  }, [butterflies]);

  return (
    <div
      ref={containerRef}
      className="xpo_pointer-events-none xpo_absolute xpo_inset-0"
    >
      {butterflies.map((b, i) => (
        <div
          key={i}
          className="butterfly xpo_absolute"
          style={{
            top: b.start.top,
            left: b.start.left,
          }}
        >
          <svg
            width={b.size}
            height={b.size}
            viewBox="0 0 60 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`wingGradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={b.wingHighlight} />
                <stop offset="100%" stopColor={b.wingColor} />
              </linearGradient>
            </defs>
            {/* Left Wing */}
            <ellipse
              className="wing"
              cx="20"
              cy="30"
              rx="14"
              ry="18"
              fill={`url(#wingGradient-${i})`}
              stroke="#1b5e20"
              strokeWidth="1"
              opacity="0.95"
            />
            {/* Right Wing */}
            <ellipse
              className="wing"
              cx="40"
              cy="30"
              rx="14"
              ry="18"
              fill={`url(#wingGradient-${i})`}
              stroke="#1b5e20"
              strokeWidth="1"
              opacity="0.95"
            />
            {/* Body */}
            <rect
              x="28"
              y="15"
              width="4"
              height="28"
              rx="2"
              fill={b.bodyColor}
            />
            <circle cx="30" cy="13" r="4" fill={b.bodyColor} />
            {/* Antennas */}
            <path
              d="M28 13 C22 2, 18 6, 25 10"
              stroke={b.bodyColor}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M32 13 C38 2, 42 6, 35 10"
              stroke={b.bodyColor}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
