import { Canvas } from "@react-three/fiber";
import { Astronaut } from "./Astronaut";
import { Planet } from "./Planet";
import { useGravityGame } from "@/lib/stores/useGravityGame";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo } from "react";

export function GameScene() {
  const { getCurrentPlanet } = useGravityGame();
  const planet = getCurrentPlanet();
  const backgroundColor = useMemo(
    () => planet.skyGradient?.top ?? planet.skyColor,
    [planet.skyGradient?.top, planet.skyColor],
  );

  return (
    <Canvas
      shadows
      camera={{
        position: [5, 3, 5],
        fov: 50,
      }}
      style={{ background: backgroundColor }}
    >
      <color attach="background" args={[backgroundColor]} />
      {planet.fogColor && <fog attach="fog" args={[planet.fogColor, 12, 45]} />}

      <ambientLight intensity={0.55} color={planet.skyColor} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      <Stars
        radius={120}
        depth={50}
        count={planet.starDensity}
        factor={4}
        saturation={0}
        fade
        speed={0.6}
      />

      <Planet />
      <Astronaut />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
