import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export default function Fly({ config }) {
  const flyRef = useRef(null);
  const partsRefs = useRef({});
  const [orientation, setOrientation] = useState("side"); // "side" or "top"

  // Animate parts motions (wings flap, body sway, etc.)
  useEffect(() => {
    if (!config) return;

    config.parts.forEach((part) => {
      const el = partsRefs.current[part.name];
      if (!el || !part.motions) return;

      // Flap motion example
      if (part.motions.flap) {
        const { rotation, origin, duration, repeat, yoyo, ease } = part.motions.flap;
        gsap.set(el, { transformOrigin: origin || "center center" });
        gsap.to(el, {
          rotation,
          duration,
          repeat,
          yoyo,
          ease,
        });
      }

      // Sway motion example
      if (part.motions.sway) {
        const { rotation, duration, repeat, yoyo, ease } = part.motions.sway;
        gsap.to(el, {
          rotation,
          duration,
          repeat,
          yoyo,
          ease,
          transformOrigin: "center center",
        });
      }
    });
  }, [config]);

  // Animate flight path with orientation changes and 3D effect (scale)
  useEffect(() => {
    if (!config || !flyRef.current) return;

    const path = config.flight.defaultPath;
    const speed = config.flight.speed || 10;

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power1.inOut" } });

    path.forEach((point, i) => {
      tl.to(flyRef.current, {
        x: point.x,
        y: point.y,
        scale: 1 + (point.z || 0),
        duration: speed,
        onStart: () => {
          setOrientation(point.orientation || "side");
        },
      });
    });

    return () => tl.kill();
  }, [config]);

  // Render parts with orientation-based visibility or transforms
  // For example, wings might be visible differently in side vs top view
  // Here, we just flip wings horizontally for side view as a simple example

  const renderPart = (part) => {
    const commonProps = {
      key: part.name,
      ref: (el) => (partsRefs.current[part.name] = el),
      ...part.props,
      style: { transformOrigin: "center center" },
    };

    // Adjust wing visibility or transform based on orientation
    if (part.name === "leftWing" || part.name === "rightWing") {
      if (orientation === "side") {
        // Side view: flatten wings (scaleY small)
        commonProps.style.transform = "scaleY(0.3)";
        commonProps.style.opacity = 0.7;
      } else {
        // Top view: normal wings
        commonProps.style.transform = "scaleY(1)";
        commonProps.style.opacity = 0.9;
      }
    }

    switch (part.type) {
      case "ellipse":
        return <ellipse {...commonProps} />;
      case "circle":
        return <circle {...commonProps} />;
      case "rect":
        return <rect {...commonProps} />;
      case "path":
        return <path {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <svg
      ref={flyRef}
      width={config.dimensions.width}
      height={config.dimensions.height}
      viewBox={`0 0 ${config.dimensions.width} ${config.dimensions.height}`}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {config.parts.map(renderPart)}
    </svg>
  );
}
