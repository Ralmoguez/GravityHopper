import { create } from "zustand";

export interface Planet {
  name: string;
  gravity: number;
  color: string;
  groundColor: string;
  skyColor: string;
  description: string;
}

export const PLANETS: Record<string, Planet> = {
  earth: {
    name: "Earth",
    gravity: 9.81,
    color: "#4A90E2",
    groundColor: "#8B7355",
    skyColor: "#87CEEB",
    description: "Our home planet with standard gravity"
  },
  moon: {
    name: "Moon",
    gravity: 1.62,
    color: "#C0C0C0",
    groundColor: "#808080",
    skyColor: "#000000",
    description: "Earth's natural satellite with low gravity"
  },
  mars: {
    name: "Mars",
    gravity: 3.71,
    color: "#CD5C5C",
    groundColor: "#A0522D",
    skyColor: "#E27B58",
    description: "The Red Planet with about 38% of Earth's gravity"
  },
  jupiter: {
    name: "Jupiter",
    gravity: 24.79,
    color: "#DAA520",
    groundColor: "#8B7355",
    skyColor: "#FFA500",
    description: "Gas giant with the strongest gravity"
  },
  saturn: {
    name: "Saturn",
    gravity: 10.44,
    color: "#F4A460",
    groundColor: "#D2691E",
    skyColor: "#FFD700",
    description: "Ringed planet with gravity similar to Earth"
  }
};

interface GravityGameState {
  selectedPlanet: string;
  playerMass: number;
  isJumping: boolean;
  
  setSelectedPlanet: (planet: string) => void;
  setPlayerMass: (mass: number) => void;
  setIsJumping: (jumping: boolean) => void;
  
  getCurrentPlanet: () => Planet;
  getWeight: () => number;
}

export const useGravityGame = create<GravityGameState>((set, get) => ({
  selectedPlanet: "earth",
  playerMass: 70,
  isJumping: false,
  
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setPlayerMass: (mass) => set({ playerMass: mass }),
  setIsJumping: (jumping) => set({ isJumping: jumping }),
  
  getCurrentPlanet: () => {
    const { selectedPlanet } = get();
    return PLANETS[selectedPlanet];
  },
  
  getWeight: () => {
    const { playerMass } = get();
    const planet = get().getCurrentPlanet();
    return playerMass * planet.gravity;
  }
}));
