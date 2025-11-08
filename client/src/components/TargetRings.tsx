import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame } from "@/lib/stores/useGravityGame";

interface Target {
  height: number;
  collected: boolean;
  ring: THREE.Mesh | null;
}

interface TargetRingsProps {
  astronautYRef: MutableRefObject<number>;
  groundOffset: number;
}

export function TargetRings({ astronautYRef, groundOffset }: TargetRingsProps) {
  const { getCurrentPlanet, jumpVelocity } = useGravityGame();
  const planet = getCurrentPlanet();
  const groupRef = useRef<THREE.Group>(null);
  const targetsRef = useRef<Target[]>([]);

  const targetHeights = useMemo(() => {
    const gravity = planet.gravity;
    const maxHeight = gravity > 0 ? (jumpVelocity * jumpVelocity) / (2 * gravity) : 0;

    return [
      maxHeight * 0.3,
      maxHeight * 0.6,
      maxHeight * 0.9
    ];
  }, [planet.gravity, jumpVelocity]);

  const [targets, setTargets] = useState<Target[]>(() => {
    const initialTargets = targetHeights.map(height => ({ height, collected: false, ring: null }));
    targetsRef.current = initialTargets;
    return initialTargets;
  });

  useEffect(() => {
    const nextTargets = targetHeights.map(height => ({ height, collected: false, ring: null }));
    targetsRef.current = nextTargets;
    setTargets(nextTargets);
  }, [targetHeights, planet.name]);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useFrame(state => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.y = state.clock.elapsedTime * 0.5;

        const target = targetsRef.current[index];
        if (!target) {
          return;
        }
        const targetCenter = target.height + groundOffset;
        const astronautY = astronautYRef.current;
        if (!target.collected && astronautY >= targetCenter - 0.3 && astronautY <= targetCenter + 0.3) {
          setTargets(prev => {
            const newTargets = [...prev];
            if (!newTargets[index].collected) {
              newTargets[index].collected = true;
            }
            return newTargets;
          });
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {targets.map((target, index) => (
        <mesh key={index} position={[0, target.height + groundOffset, 0]}>
          <torusGeometry args={[0.8, 0.15, 16, 32]} />
          <meshStandardMaterial
            color={target.collected ? "#4CAF50" : "#FFC107"}
            emissive={target.collected ? "#4CAF50" : "#FFC107"}
            emissiveIntensity={target.collected ? 0.3 : 0.8}
            transparent
            opacity={target.collected ? 0.3 : 0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
