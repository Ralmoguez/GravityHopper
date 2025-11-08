import { useGravityGame } from "@/lib/stores/useGravityGame";
import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function useSkyGradientTexture(top: string, bottom: string) {
  return useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [top, bottom]);
}

export function Planet() {
  const { getCurrentPlanet } = useGravityGame();
  const planet = getCurrentPlanet();
  const surfaceTexture = useTexture(planet.surfaceTexture);
  const skyTexture = useSkyGradientTexture(
    planet.skyGradient?.top ?? planet.skyColor,
    planet.skyGradient?.bottom ?? planet.skyColor,
  );

  useEffect(() => {
    surfaceTexture.wrapS = THREE.RepeatWrapping;
    surfaceTexture.wrapT = THREE.RepeatWrapping;
    surfaceTexture.repeat.set(planet.surfaceRepeat, planet.surfaceRepeat);
    surfaceTexture.colorSpace = THREE.SRGBColorSpace;
  }, [surfaceTexture, planet.surfaceRepeat]);

  useEffect(() => {
    return () => {
      skyTexture?.dispose();
    };
  }, [skyTexture]);

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color={planet.groundColor}
          map={surfaceTexture}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.15, 64]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>

      {planet.ring && (
        <mesh rotation={[Math.PI / 2, 0, planet.ring.tilt ?? 0]} position={[0, 0.1, 0]} receiveShadow>
          <ringGeometry args={[planet.ring.innerRadius, planet.ring.outerRadius, 64]} />
          <meshBasicMaterial
            color={planet.ring.color}
            transparent
            opacity={planet.ring.opacity ?? 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {skyTexture && (
        <mesh scale={-1}>
          <sphereGeometry args={[120, 64, 64]} />
          <meshBasicMaterial map={skyTexture} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}
