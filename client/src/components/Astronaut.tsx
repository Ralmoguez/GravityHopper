import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame, PLANETS } from "@/lib/stores/useGravityGame";
import { useKeyboardControls } from "@react-three/drei";

enum Controls {
  jump = 'jump',
}

export function Astronaut() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedPlanet, isJumping, setIsJumping } = useGravityGame();
  const [velocity, setVelocity] = useState(0);
  const [position, setPosition] = useState(0);
  const [subscribe, getState] = useKeyboardControls<Controls>();

  const planet = PLANETS[selectedPlanet];
  const gravity = planet.gravity;

  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state.jump,
      (pressed) => {
        if (pressed && !isJumping && position <= 0.01) {
          console.log(`Jump initiated on ${planet.name}! Gravity: ${gravity}`);
          const jumpVelocity = 8;
          setVelocity(jumpVelocity);
          setIsJumping(true);
        }
      }
    );
    return unsubscribe;
  }, [subscribe, isJumping, position, gravity, planet.name, setIsJumping]);

  useEffect(() => {
    setPosition(0);
    setVelocity(0);
    setIsJumping(false);
  }, [selectedPlanet, setIsJumping]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isJumping || position > 0) {
      const newVelocity = velocity - gravity * delta;
      setVelocity(newVelocity);

      const newPosition = Math.max(0, position + newVelocity * delta);
      setPosition(newPosition);

      meshRef.current.position.y = newPosition + 0.5;

      if (newPosition <= 0 && velocity < 0) {
        setPosition(0);
        setVelocity(0);
        setIsJumping(false);
        meshRef.current.position.y = 0.5;
      }
    } else {
      meshRef.current.position.y = 0.5;
    }

    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      <mesh position={[0, 1.3, 0.1]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#E8E8E8" transparent opacity={0.9} />
      </mesh>
      
      <mesh position={[0, 1.3, 0.35]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.1]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>
    </group>
  );
}
