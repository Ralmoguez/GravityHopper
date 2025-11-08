import { useGravityGame } from "@/lib/stores/useGravityGame";
import * as THREE from "three";

export function Planet() {
  const { getCurrentPlanet } = useGravityGame();
  const planet = getCurrentPlanet();

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={planet.groundColor} />
      </mesh>
      
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.2} />
      </mesh>
    </>
  );
}
