import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const GrassBlade = ({ x, height, width, hue, leafCount }) => {
  const grassRef = useRef(null);

  useEffect(() => {
    const blade = grassRef.current;
    
    gsap.to(blade, {
      rotation: () => gsap.utils.random(-8, 8),
      transformOrigin: "bottom center",
      duration: gsap.utils.random(2, 4),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: gsap.utils.random(0, 2),
    });

    gsap.to(blade, {
      scaleX: () => gsap.utils.random(0.9, 1.1),
      duration: gsap.utils.random(3, 6),
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      delay: gsap.utils.random(0, 3),
    });
  }, []);

  const leafPositions = Array.from({ length: leafCount }).map((_, i) => ({
    height: (height / leafCount) * (i + 1) - 10,
    side: Math.random() > 0.5 ? 'left' : 'right',
    size: 4 + Math.random() * 6,
  }));

  return (
    <div
      ref={grassRef}
      className="xpo_absolute"
      style={{
        left: `${x}%`,
        bottom: '0px',
        transformOrigin: "bottom center",
      }}
    >
      <div
        className="xpo_relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: `hsl(${hue}, 60%, 25%)`,
          borderRadius: "2px 2px 0 0",
        }}
      >
        {leafPositions.map((leaf, i) => (
          <div
            key={i}
            className="xpo_absolute"
            style={{
              width: `${leaf.size}px`,
              height: `${leaf.size * 0.6}px`,
              backgroundColor: `hsl(${hue + 10}, 65%, 30%)`,
              borderRadius: "50% 10% 50% 10%",
              bottom: `${leaf.height}px`,
              [leaf.side]: '-2px',
              transformOrigin: leaf.side === 'left' ? 'bottom right' : 'bottom left',
              transform: `rotate(${leaf.side === 'left' ? -25 : 25}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const TallGrass = ({ x, height, thickness }) => {
  const grassRef = useRef(null);

  useEffect(() => {
    const grass = grassRef.current;
    
    gsap.to(grass, {
      rotation: () => gsap.utils.random(-12, 12),
      transformOrigin: "bottom center",
      duration: gsap.utils.random(1.5, 3),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: gsap.utils.random(0, 2),
    });
  }, []);

  return (
    <div
      ref={grassRef}
      className="xpo_absolute"
      style={{
        left: `${x}%`,
        bottom: '0px',
        width: `${thickness}px`,
        height: `${height}px`,
        backgroundColor: `hsl(${85 + Math.random() * 30}, 55%, 28%)`,
        borderRadius: `${thickness}px ${thickness}px 0 0`,
        transformOrigin: "bottom center",
      }}
    />
  );
};

const SmallPlant = ({ x, stemHeight, leafSize }) => {
  const plantRef = useRef(null);

  useEffect(() => {
    const plant = plantRef.current;
    
    gsap.to(plant, {
      rotation: () => gsap.utils.random(-6, 6),
      transformOrigin: "bottom center",
      duration: gsap.utils.random(2.5, 4.5),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: gsap.utils.random(0, 3),
    });
  }, []);

  return (
    <div
      ref={plantRef}
      className="xpo_absolute"
      style={{
        left: `${x}%`,
        bottom: '0px',
        transformOrigin: "bottom center",
      }}
    >
      <div
        style={{
          width: '1px',
          height: `${stemHeight}px`,
          backgroundColor: 'hsl(95, 50%, 25%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '-4px',
            width: `${leafSize}px`,
            height: `${leafSize * 0.7}px`,
            backgroundColor: 'hsl(110, 60%, 30%)',
            borderRadius: '0 100% 0 100%',
            transform: 'rotate(-30deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '-4px',
            width: `${leafSize}px`,
            height: `${leafSize * 0.7}px`,
            backgroundColor: 'hsl(110, 60%, 30%)',
            borderRadius: '100% 0 100% 0',
            transform: 'rotate(30deg)',
          }}
        />
      </div>
    </div>
  );
};

const WildFlower = ({ x, color, stemHeight }) => {
  const flowerRef = useRef(null);

  useEffect(() => {
    const flower = flowerRef.current;
    
    gsap.to(flower, {
      rotation: () => gsap.utils.random(-8, 8),
      transformOrigin: "bottom center",
      duration: gsap.utils.random(3, 5),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: gsap.utils.random(0, 3),
    });
  }, []);

  return (
    <div
      ref={flowerRef}
      className="xpo_absolute"
      style={{
        left: `${x}%`,
        bottom: '0px',
        transformOrigin: "bottom center",
      }}
    >
      <div
        style={{
          width: '1px',
          height: `${stemHeight}px`,
          backgroundColor: 'hsl(90, 45%, 25%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            width: '6px',
            height: '6px',
            backgroundColor: color,
            borderRadius: '50%',
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

const Firefly = ({ x, y, glowColor = '#fef08a' }) => {
  const fireflyRef = useRef(null);

  useEffect(() => {
    const firefly = fireflyRef.current;
    
    gsap.to(firefly, {
      motionPath: {
        path: `M0,0 Q${gsap.utils.random(-30, 30)},${gsap.utils.random(-20, 20)} ${gsap.utils.random(-50, 50)},${gsap.utils.random(-30, 30)} T${gsap.utils.random(-40, 40)},${gsap.utils.random(-25, 25)}`,
        autoRotate: false,
      },
      duration: gsap.utils.random(12, 20),
      repeat: -1,
      ease: "none",
      delay: gsap.utils.random(0, 8),
    });

    gsap.to(firefly, {
      scale: gsap.utils.random(0.9, 1.2),
      opacity: gsap.utils.random(0.7, 1),
      duration: gsap.utils.random(2, 4),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: gsap.utils.random(0, 3),
    });

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(firefly, {
      x: `+=${gsap.utils.random(-8, 8)}`,
      y: `+=${gsap.utils.random(-6, 6)}`,
      duration: gsap.utils.random(1, 2),
      ease: "power1.inOut",
    })
    .to(firefly, {
      x: `+=${gsap.utils.random(-8, 8)}`,
      y: `+=${gsap.utils.random(-6, 6)}`,
      duration: gsap.utils.random(1, 2),
      ease: "power1.inOut",
    })
    .to(firefly, {
      x: `+=${gsap.utils.random(-12, 12)}`,
      y: `+=${gsap.utils.random(-8, 8)}`,
      duration: gsap.utils.random(2, 3),
      ease: "power1.inOut",
    });

  }, []);

  return (
    <div
      ref={fireflyRef}
      className="xpo_absolute xpo_w-1 xpo_h-1 xpo_bg-yellow-300 xpo_rounded-full xpo_pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        boxShadow: `0 0 6px ${glowColor}, 0 0 3px ${glowColor}`,
      }}
    />
  );
};

export default function MoonlitMeadow() {
  const meadowRef = useRef(null);

  const [grassBlades] = useState(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      height: 25 + Math.random() * 50,
      width: 2 + Math.random() * 3,
      hue: 85 + Math.random() * 35,
      leafCount: Math.floor(1 + Math.random() * 3),
    }))
  );

  const [tallGrass] = useState(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      height: 40 + Math.random() * 80,
      thickness: 1 + Math.random() * 2,
    }))
  );

  const [smallPlants] = useState(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      stemHeight: 15 + Math.random() * 25,
      leafSize: 6 + Math.random() * 8,
    }))
  );

  const [wildFlowers] = useState(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      stemHeight: 18 + Math.random() * 30,
      color: ['#ff6b9d', '#ffd93d', '#74c0fc', '#ff8cc8', '#b197fc'][Math.floor(Math.random() * 5)],
    }))
  );

  useEffect(() => {
    const container = meadowRef.current;
    
    gsap.set(container, {
      opacity: 0,
    });

    gsap.to(container, {
      opacity: 1,
      duration: 2,
      ease: "power2.inOut",
    });

    const windInterval = setInterval(() => {
      const allElements = container.querySelectorAll('.absolute');
      
      gsap.to(allElements, {
        rotation: () => gsap.utils.random(-15, 15),
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.03,
        yoyo: true,
        repeat: 1,
      });
    }, gsap.utils.random(4000, 8000));

    return () => clearInterval(windInterval);
  }, []);

  return (
    <div 
      ref={meadowRef}
      className="xpo_relative xpo_h-full xpo_overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      {grassBlades.map((grass) => (
        <GrassBlade
          key={grass.id}
          x={grass.x}
          height={grass.height}
          width={grass.width}
          hue={grass.hue}
          leafCount={grass.leafCount}
        />
      ))}

      {tallGrass.map((grass) => (
        <TallGrass
          key={grass.id}
          x={grass.x}
          height={grass.height}
          thickness={grass.thickness}
        />
      ))}

      {smallPlants.map((plant) => (
        <SmallPlant
          key={plant.id}
          x={plant.x}
          stemHeight={plant.stemHeight}
          leafSize={plant.leafSize}
        />
      ))}

      {wildFlowers.map((flower) => (
        <WildFlower
          key={flower.id}
          x={flower.x}
          color={flower.color}
          stemHeight={flower.stemHeight}
        />
      ))}

      <div className="xpo_absolute xpo_inset-0 xpo_pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <Firefly
            key={`firefly-${i}`}
            x={Math.random() * 100}
            y={20 + Math.random() * 60}
            glowColor={['#fef08a', '#fbbf24', '#facc15'][Math.floor(Math.random() * 3)]}
          />
        ))}
      </div>

    </div>
  );
}