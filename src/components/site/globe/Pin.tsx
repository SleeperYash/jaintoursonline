import { useMemo, useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { GlobeDestination } from "@/data/globeDestinations";
import { latLngToVec3 } from "@/lib/latLngToVec3";

interface PinProps {
  destination: GlobeDestination;
  isActive: boolean;
  onSelect: (slug: string) => void;
}

const PIN_COLOR = new THREE.Color(0xeac15e); // gold
const PIN_COLOR_ACTIVE = new THREE.Color(0xfff1c2); // bright

const Pin = ({ destination, isActive, onSelect }: PinProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = useMemo(
    () => latLngToVec3(destination.lat, destination.lng, 1.005),
    [destination.lat, destination.lng]
  );

  // Pin should "stand up" perpendicular to the surface.
  const lookTarget = useMemo(() => position.clone().multiplyScalar(2), [position]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (haloRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.18;
      const baseScale = isActive ? 1.6 : hovered ? 1.4 : 1;
      haloRef.current.scale.setScalar(baseScale * pulse);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isActive ? 0.55 : hovered ? 0.45 : 0.25) * (0.7 + Math.sin(t * 2.5) * 0.3);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(destination.slug);
  };
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "";
  };

  const dotColor = isActive || hovered ? PIN_COLOR_ACTIVE : PIN_COLOR;
  const dotScale = isActive ? 1.6 : hovered ? 1.3 : 1;

  return (
    <group ref={groupRef} position={position} onUpdate={(g) => g.lookAt(lookTarget)}>
      {/* Halo (faces camera-ish via flat plane normal) */}
      <mesh
        ref={haloRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <ringGeometry args={[0.018, 0.04, 32]} />
        <meshBasicMaterial
          color={PIN_COLOR}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Solid dot */}
      <mesh
        scale={dotScale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color={dotColor} />
      </mesh>

      {(hovered || isActive) && (
        <Html
          center
          distanceFactor={6}
          style={{ pointerEvents: "none", transform: "translateY(-28px)" }}
        >
          <div className="px-2 py-1 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap bg-card/90 border border-gold/40 text-gold rounded shadow-luxe">
            {destination.name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Pin;
