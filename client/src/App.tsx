import { KeyboardControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { GameScene } from "./components/GameScene";
import { GameUI } from "./components/GameUI";
import "@fontsource/inter";

enum Controls {
  jump = 'jump',
}

const controls = [
  { name: Controls.jump, keys: ['Space'] },
];

function App() {
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          <GameScene />
          <GameUI />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
