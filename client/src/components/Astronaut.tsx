import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGravityGame, PLANETS } from "@/lib/stores/useGravityGame";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import { useAudio } from "@/lib/stores/useAudio";
import { JumpParticles } from "./JumpParticles";
import { TargetRings } from "./TargetRings";

enum Controls {
  jump = 'jump',
}

export function Astronaut() {
  const astronautGroupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const { selectedPlanet, setIsJumping, jumpVelocity } = useGravityGame();
  const { playHit, playSuccess } = useAudio();
  const velocityRef = useRef(0);
  const positionRef = useRef(0);
  const wasOnGroundRef = useRef(true);
  const isJumpingAnimationRef = useRef(false);
  const [, getState] = useKeyboardControls<Controls>();

  const planet = PLANETS[selectedPlanet];
  const gravity = planet.gravity;

  const gltf = useGLTF("/models/astronaut.gltf");
  const { model, centerOffset } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    const wrapper = new THREE.Group();
    wrapper.name = "AstronautWrapper";
    wrapper.add(clonedScene);

    const scale = 0.85;
    clonedScene.scale.setScalar(scale);

    const box = new THREE.Box3().setFromObject(clonedScene);
    const minY = box.min.y;
    const maxY = box.max.y;
    clonedScene.position.y -= minY;

    clonedScene.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const offset = (maxY - minY) / 2;

    return { model: wrapper, centerOffset: offset };
  }, [gltf.scene]);

  const astronautYRef = useRef(centerOffset);
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);

  useEffect(() => {
    positionRef.current = 0;
    velocityRef.current = 0;
    wasOnGroundRef.current = true;
    setIsJumping(false);
    isJumpingAnimationRef.current = false;
    if (astronautGroupRef.current) {
      astronautGroupRef.current.position.y = 0;
    }
    if (actions?.Jump) {
      actions.Jump.stop();
    }
    const idleAction = actions?.Idle;
    if (idleAction) {
      idleAction.reset().fadeIn(0).play();
    }
    astronautYRef.current = centerOffset;
  }, [selectedPlanet, setIsJumping, jumpVelocity, actions, centerOffset]);

  useEffect(() => {
    const idleAction = actions?.Idle;
    if (idleAction) {
      idleAction.reset().fadeIn(0.2).play();
      idleAction.setEffectiveWeight(1);
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
    }
  }, [actions]);

  useEffect(() => {
    if (!mixer || !actions?.Idle || !actions?.Jump) return;

    const handleFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (event.action === actions.Jump) {
        actions.Idle?.reset().fadeIn(0.2).play();
        isJumpingAnimationRef.current = false;
      }
    };

    mixer.addEventListener("finished", handleFinished);
    return () => {
      mixer.removeEventListener("finished", handleFinished);
    };
  }, [actions, mixer]);

  useFrame((state, delta) => {
    if (!astronautGroupRef.current) return;

    const controls = getState();

    if (controls.jump && positionRef.current <= 0.01 && velocityRef.current <= 0) {
      velocityRef.current = jumpVelocity;
      setIsJumping(true);
      playHit();
      wasOnGroundRef.current = false;

      const jumpAction = actions?.Jump;
      const idleAction = actions?.Idle;
      if (jumpAction) {
        idleAction?.fadeOut(0.1);
        jumpAction.reset();
        jumpAction.setLoop(THREE.LoopOnce, 1);
        jumpAction.clampWhenFinished = true;
        const clipDuration = jumpAction.getClip().duration || 1;
        const flightDuration = gravity > 0.0001 ? Math.max(0.4, (2 * jumpVelocity) / gravity) : 1;
        const timeScale = flightDuration > 0.0001 ? clipDuration / flightDuration : 1;
        jumpAction.setEffectiveTimeScale(timeScale);
        jumpAction.setEffectiveWeight(1);
        jumpAction.play();
        isJumpingAnimationRef.current = true;
      }
    }

    if (positionRef.current > 0 || velocityRef.current > 0) {
      velocityRef.current -= gravity * delta;
      positionRef.current = Math.max(0, positionRef.current + velocityRef.current * delta);

      const newY = positionRef.current;
      astronautGroupRef.current.position.y = newY;
      astronautYRef.current = newY + centerOffset;

      if (positionRef.current <= 0 && velocityRef.current < 0) {
        positionRef.current = 0;
        velocityRef.current = 0;
        setIsJumping(false);
        astronautGroupRef.current.position.y = 0;
        astronautYRef.current = centerOffset;

        if (!wasOnGroundRef.current) {
          playSuccess();
          wasOnGroundRef.current = true;
        }

        if (isJumpingAnimationRef.current) {
          actions?.Jump?.stop();
          actions?.Idle?.reset().fadeIn(0.2).play();
          isJumpingAnimationRef.current = false;
        }
      }
    } else {
      astronautGroupRef.current.position.y = 0;
      astronautYRef.current = centerOffset;
    }

    astronautGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group>
      <group ref={astronautGroupRef}>
        <primitive ref={modelRef} object={model} />
      </group>

      <JumpParticles astronautYRef={astronautYRef} groundOffset={centerOffset} />
      <TargetRings astronautYRef={astronautYRef} groundOffset={centerOffset} />
    </group>
  );
}

useGLTF.preload("/models/astronaut.gltf");
