import { Canvas } from "@react-three/fiber";
import { Astronaut } from "./Astronaut";
import { Planet } from "./Planet";
import { useGravityGame } from "@/lib/stores/useGravityGame";
import { OrbitControls } from "@react-three/drei";

export function GameScene() {
  const { getCurrentPlanet } = useGravityGame();
  const planet = getCurrentPlanet();

  return (
    <Canvas
      shadows
      camera={{
        position: [5, 3, 5],
        fov: 50,
      }}
      style={{ background: planet.skyColor }}
    >
      <color attach="background" args={[planet.skyColor]} />
      
      <ambientLight intensity={0.5} />
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
