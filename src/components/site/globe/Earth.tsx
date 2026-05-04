import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface EarthProps {
  spinning: boolean;
}

const EARTH_TEXTURE_URL =
  "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_NORMAL_URL =
  "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg";
const EARTH_SPECULAR_URL =
  "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg";

const Earth = ({ spinning }: EarthProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const [dayMap, normalMap, specMap] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE_URL,
    EARTH_NORMAL_URL,
    EARTH_SPECULAR_URL,
  ]);

  // Color-space tuning so it reads well over the navy theme.
  if (dayMap) dayMap.colorSpace = THREE.SRGBColorSpace;

  useFrame((_state, delta) => {
    if (ref.current && spinning) {
      ref.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={ref} rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[1, 96, 96]} />
      <meshPhongMaterial
        map={dayMap}
        normalMap={normalMap}
        specularMap={specMap}
        specular={new THREE.Color(0x1a3a6e)}
        shininess={18}
      />
    </mesh>
  );
};

export default Earth;
