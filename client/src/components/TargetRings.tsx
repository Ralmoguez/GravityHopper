import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame } from "@/lib/stores/useGravityGame";

interface Target {
  height: number;
  collected: boolean;
  ring: THREE.Mesh | null;
}

export function TargetRings({ astronautY }: { astronautY: number }) {
  const { getCurrentPlanet, jumpVelocity } = useGravityGame();
  const planet = getCurrentPlanet();
  const groupRef = useRef<THREE.Group>(null);
  
  const targetHeights = useMemo(() => {
    const gravity = planet.gravity;
    const maxHeight = (jumpVelocity * jumpVelocity) / (2 * gravity);

    return [
      maxHeight * 0.3,
      maxHeight * 0.6,
      maxHeight * 0.9
    ];
  }, [planet.gravity, jumpVelocity]);

  const [targets, setTargets] = useState<Target[]>(
    targetHeights.map(height => ({ height, collected: false, ring: null }))
  );

  useEffect(() => {
    setTargets(targetHeights.map(height => ({ height, collected: false, ring: null })));
    console.log(`Target rings reset for ${planet.name} at heights:`, targetHeights.map(h => h.toFixed(2) + 'm'));
  }, [targetHeights, planet.name]);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.y = state.clock.elapsedTime * 0.5;
        
        const target = targets[index];
        if (!target.collected && astronautY >= target.height - 0.3 && astronautY <= target.height + 0.3) {
          setTargets(prev => {
            const newTargets = [...prev];
            if (!newTargets[index].collected) {
              newTargets[index].collected = true;
              console.log(`Target ${index + 1} collected at height ${target.height.toFixed(2)}m!`);
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
        <mesh key={index} position={[0, target.height + 0.5, 0]}>
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
