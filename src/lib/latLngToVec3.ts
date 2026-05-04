import * as THREE from "three";

/**
 * Convert latitude/longitude (in degrees) to a 3D point on a sphere of given radius.
 * Standard equirectangular → sphere mapping where:
 *   - The texture's seam (lng = 180°/-180°) sits at +Z by default in three.js
 *   - We add π/2 (90°) to longitude so lng=0 maps to +X (Greenwich at world right)
 *   - Then the Earth mesh is rotated -π/2 in Y so Greenwich faces the camera at start
 */
export function latLngToVec3(latDeg: number, lngDeg: number, radius = 1): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180); // polar angle from +Y
  const theta = (lngDeg + 180) * (Math.PI / 180); // azimuth, with seam at the back
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
