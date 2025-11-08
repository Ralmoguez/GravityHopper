import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame, PLANETS } from "@/lib/stores/useGravityGame";
import { useKeyboardControls } from "@react-three/drei";
import { useAudio } from "@/lib/stores/useAudio";
import { JumpParticles } from "./JumpParticles";
import { TargetRings } from "./TargetRings";

enum Controls {
  jump = 'jump',
}

export function Astronaut() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedPlanet, setIsJumping } = useGravityGame();
  const { playHit, playSuccess } = useAudio();
  const velocityRef = useRef(0);
  const positionRef = useRef(0);
  const wasOnGroundRef = useRef(true);
  const [currentY, setCurrentY] = useState(0.5);
  const [, getState] = useKeyboardControls<Controls>();

  const planet = PLANETS[selectedPlanet];
  const gravity = planet.gravity;

  useEffect(() => {
    positionRef.current = 0;
    velocityRef.current = 0;
    wasOnGroundRef.current = true;
    setIsJumping(false);
    if (meshRef.current) {
      meshRef.current.position.y = 0.5;
    }
  }, [selectedPlanet, setIsJumping]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const controls = getState();
    
    if (controls.jump && positionRef.current <= 0.01 && velocityRef.current <= 0) {
      console.log(`Jump initiated on ${planet.name}! Gravity: ${gravity}`);
      velocityRef.current = 8;
      setIsJumping(true);
      playHit();
      wasOnGroundRef.current = false;
    }

    if (positionRef.current > 0 || velocityRef.current > 0) {
      velocityRef.current -= gravity * delta;
      positionRef.current = Math.max(0, positionRef.current + velocityRef.current * delta);

      const newY = positionRef.current + 0.5;
      meshRef.current.position.y = newY;
      setCurrentY(newY);

      if (positionRef.current <= 0 && velocityRef.current < 0) {
        positionRef.current = 0;
        velocityRef.current = 0;
        setIsJumping(false);
        meshRef.current.position.y = 0.5;
        setCurrentY(0.5);
        
        if (!wasOnGroundRef.current) {
          playSuccess();
          wasOnGroundRef.current = true;
        }
      }
    } else {
      meshRef.current.position.y = 0.5;
      setCurrentY(0.5);
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
      
      <JumpParticles astronautY={currentY} />
      <TargetRings astronautY={currentY} />
    </group>
  );
}
