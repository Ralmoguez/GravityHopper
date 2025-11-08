import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame } from "@/lib/stores/useGravityGame";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface JumpParticlesProps {
  astronautYRef: MutableRefObject<number>;
  groundOffset: number;
}

export function JumpParticles({ astronautYRef, groundOffset }: JumpParticlesProps) {
  const { getCurrentPlanet } = useGravityGame();
  const planet = getCurrentPlanet();
  const particlesRef = useRef<THREE.Points>(null);
  const particlesDataRef = useRef<Particle[]>([]);
  const lastYRef = useRef(astronautYRef.current);
  const maxParticles = 50;

  const particleGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(maxParticles * 3), []);
  const colors = useMemo(() => new Float32Array(maxParticles * 3), []);

  useEffect(() => {
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return () => {
      particleGeometry.dispose();
    };
  }, [particleGeometry, positions, colors]);

  const particleMaterial = useMemo(() => {
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    return material;
  }, []);

  useEffect(() => () => {
    particleMaterial.dispose();
  }, [particleMaterial]);

  const planetTrailColor = useMemo(() => new THREE.Color(planet.color), [planet.color]);

  useEffect(() => {
    particlesDataRef.current = [];
    positions.fill(0);
    colors.fill(0);

    const positionAttr = particleGeometry.getAttribute("position");
    const colorAttr = particleGeometry.getAttribute("color");
    if (positionAttr) positionAttr.needsUpdate = true;
    if (colorAttr) colorAttr.needsUpdate = true;

    lastYRef.current = astronautYRef.current;
  }, [planet.name, planet.color, planet.groundColor, groundOffset, astronautYRef, particleGeometry, positions, colors]);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;

    const astronautY = astronautYRef.current;
    const landingThreshold = groundOffset + 0.05;
    const justLanded = lastYRef.current > landingThreshold && astronautY <= landingThreshold;
    lastYRef.current = astronautY;

    if (justLanded && particlesDataRef.current.length < maxParticles - 10) {
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
        particle.position.addScaledVector(particle.velocity, delta);

        const idx = i * 3;
        positions[idx] = particle.position.x;
        positions[idx + 1] = Math.max(particle.position.y, 0.05);
        positions[idx + 2] = particle.position.z;

        const alpha = particle.life / particle.maxLife;
        colors[idx] = planetTrailColor.r * alpha;
        colors[idx + 1] = planetTrailColor.g * alpha;
        colors[idx + 2] = planetTrailColor.b * alpha;
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

  return (
    <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
  );
}
