import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame } from "@/lib/stores/useGravityGame";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export function JumpParticles({ astronautY }: { astronautY: number }) {
  const { getCurrentPlanet } = useGravityGame();
  const planet = getCurrentPlanet();
  const particlesRef = useRef<THREE.Points>(null);
  const particlesDataRef = useRef<Particle[]>([]);
  const lastYRef = useRef(astronautY);
  const maxParticles = 50;

  const particleGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(maxParticles * 3), []);
  const colors = useMemo(() => new Float32Array(maxParticles * 3), []);

  useMemo(() => {
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [particleGeometry, positions, colors]);

  const particleMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const wasDescending = lastYRef.current > astronautY && astronautY > 0.1;
    const justLanded = lastYRef.current > 0.5 && astronautY <= 0.5;
    lastYRef.current = astronautY;

    if (justLanded && particlesDataRef.current.length < maxParticles - 10) {
      const planetColorRGB = new THREE.Color(planet.groundColor);
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10;
        const speed = 1 + Math.random() * 1.5;
        particlesDataRef.current.push({
          position: new THREE.Vector3(
            Math.cos(angle) * 0.3,
            0.1,
            Math.sin(angle) * 0.3
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            0.5 + Math.random() * 1,
            Math.sin(angle) * speed
          ),
          life: 1,
          maxLife: 1,
        });
      }
    }

    particlesDataRef.current.forEach((particle, i) => {
      particle.life -= delta;
      if (particle.life > 0) {
        particle.velocity.y -= 5 * delta;
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        const idx = i * 3;
        positions[idx] = particle.position.x;
        positions[idx + 1] = Math.max(particle.position.y, 0.05);
        positions[idx + 2] = particle.position.z;

        const planetColorRGB = new THREE.Color(planet.color);
        const alpha = particle.life / particle.maxLife;
        colors[idx] = planetColorRGB.r * alpha;
        colors[idx + 1] = planetColorRGB.g * alpha;
        colors[idx + 2] = planetColorRGB.b * alpha;
      } else {
        const idx = i * 3;
        positions[idx] = 0;
        positions[idx + 1] = -100;
        positions[idx + 2] = 0;
      }
    });

    particlesDataRef.current = particlesDataRef.current.filter(p => p.life > 0);

    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.color.needsUpdate = true;
  });

  return <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />;
}
