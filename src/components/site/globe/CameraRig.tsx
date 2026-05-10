import { useImperativeHandle, useRef, forwardRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { latLngToVec3 } from "@/lib/latLngToVec3";

export type CameraRigHandle = {
  flyTo: (lat: number, lng: number) => void;
};

interface Props {
  onUserInteract?: () => void;
}

const CAM_DISTANCE = 2.6;
const FLY_DURATION = 1400; // ms

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CameraRig = forwardRef<CameraRigHandle, Props>(({ onUserInteract }, ref) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Animation state stored in refs so useFrame can update without re-renders.
  const animRef = useRef<{
    active: boolean;
    start: number;
    fromCam: THREE.Vector3;
    toCam: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    duration: number;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number) => {
      // Place the camera along the surface-normal of (lat, lng) at fixed distance.
      const surfacePoint = latLngToVec3(lat, lng, 1);
      const camTarget = surfacePoint.clone().multiplyScalar(CAM_DISTANCE);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduced ? 300 : FLY_DURATION;

      animRef.current = {
        active: true,
        start: performance.now(),
        fromCam: camera.position.clone(),
        toCam: camTarget,
        fromTarget: controlsRef.current?.target?.clone?.() ?? new THREE.Vector3(),
        toTarget: new THREE.Vector3(0, 0, 0),
        duration,
      };
    },
  }));

  // Initial camera placement
  useEffect(() => {
    camera.position.set(0, 0.4, CAM_DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(() => {
    const a = animRef.current;
    if (!a || !a.active) return;
    const elapsed = performance.now() - a.start;
    const t = Math.min(1, elapsed / a.duration);
    const k = easeInOutCubic(t);
    camera.position.lerpVectors(a.fromCam, a.toCam, k);
    if (controlsRef.current?.target) {
      controlsRef.current.target.lerpVectors(a.fromTarget, a.toTarget, k);
      controlsRef.current.update();
    }
    if (t >= 1) a.active = false;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={1.6}
      maxDistance={4}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      onStart={onUserInteract}
    />
  );
});

CameraRig.displayName = "CameraRig";

export default CameraRig;
