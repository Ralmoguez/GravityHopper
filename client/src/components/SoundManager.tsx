import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export function SoundManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const jumpSound = new Audio("/sounds/hit.mp3");
    setHitSound(jumpSound);

    const landSound = new Audio("/sounds/success.mp3");
    setSuccessSound(landSound);

    console.log("Sound manager initialized");
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return null;
}
