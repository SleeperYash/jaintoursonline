import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const CLOUDS_URL =
  "https://threejs.org/examples/textures/planets/earth_clouds_1024.png";

interface Props {
  spinning: boolean;
}

const Clouds = ({ spinning }: Props) => {
  const ref = useRef<THREE.Mesh>(null);
  const cloudMap = useLoader(THREE.TextureLoader, CLOUDS_URL);

  useFrame((_state, delta) => {
    if (ref.current && spinning) {
      ref.current.rotation.y += delta * 0.07;
    }
  });

  return (
    <mesh ref={ref} rotation={[0, -Math.PI / 2, 0]} scale={1.005}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial
        map={cloudMap}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Clouds;
