import { Suspense, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import Earth from "./Earth";
import Atmosphere from "./Atmosphere";
import Clouds from "./Clouds";
import Pin from "./Pin";
import CameraRig, { type CameraRigHandle } from "./CameraRig";
import { globeDestinations } from "@/data/globeDestinations";

export type Globe3DHandle = {
  flyToSlug: (slug: string) => void;
};

interface Props {
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}

const Globe3D = forwardRef<Globe3DHandle, Props>(({ activeSlug, onSelect }, ref) => {
  const rigRef = useRef<CameraRigHandle>(null);
  const [autoSpin, setAutoSpin] = useState(true);
  const idleTimerRef = useRef<number | null>(null);

  // Auto-spin pause logic
  const handleUserInteract = () => {
    setAutoSpin(false);
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => setAutoSpin(true), 6000);
  };

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Fly when activeSlug changes externally
  useImperativeHandle(ref, () => ({
    flyToSlug: (slug: string) => {
      const d = globeDestinations.find((x) => x.slug === slug);
      if (d) {
        rigRef.current?.flyTo(d.lat, d.lng);
        setAutoSpin(false);
        if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(() => setAutoSpin(true), 6000);
      }
    },
  }));

  return (
    <Canvas
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.4, 2.6] }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} />
      <directionalLight position={[-5, -2, -3]} intensity={0.25} color="#9ec0ff" />

      <Stars
        radius={50}
        depth={40}
        count={3500}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />

      <Suspense fallback={null}>
        <Earth spinning={autoSpin} />
        <Clouds spinning={autoSpin} />
      </Suspense>
      <Atmosphere />

      {globeDestinations.map((d) => (
        <Pin
          key={d.slug}
          destination={d}
          isActive={d.slug === activeSlug}
          onSelect={(slug) => {
            onSelect(slug);
            handleUserInteract();
          }}
        />
      ))}

      <CameraRig ref={rigRef} onUserInteract={handleUserInteract} />
    </Canvas>
  );
});

Globe3D.displayName = "Globe3D";

export default Globe3D;
