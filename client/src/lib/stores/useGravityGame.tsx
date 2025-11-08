import { create } from "zustand";

export interface Planet {
  name: string;
  gravity: number;
  color: string;
  groundColor: string;
  skyColor: string;
  description: string;
  mass: string;
  radius: string;
  scientificExplanation: string;
}

export const PLANETS: Record<string, Planet> = {
  earth: {
    name: "Earth",
    gravity: 9.81,
    color: "#4A90E2",
    groundColor: "#8B7355",
    skyColor: "#87CEEB",
    description: "Our home planet with standard gravity",
    mass: "5.97 × 10²⁴ kg",
    radius: "6,371 km",
    scientificExplanation: "Earth's gravity is determined by its mass and radius. The formula g = GM/r² shows that gravity depends on the planet's mass (M) and the square of its radius (r). Earth's moderate mass and size create the familiar 9.81 m/s² we experience daily."
  },
  moon: {
    name: "Moon",
    gravity: 1.62,
    color: "#C0C0C0",
    groundColor: "#808080",
    skyColor: "#000000",
    description: "Earth's natural satellite with low gravity",
    mass: "7.35 × 10²² kg",
    radius: "1,737 km",
    scientificExplanation: "The Moon has only 1/6th of Earth's gravity because it has much less mass (1/81 of Earth) and a smaller radius. Despite being smaller, the reduced mass has a greater effect, resulting in significantly weaker gravitational pull."
  },
  mars: {
    name: "Mars",
    gravity: 3.71,
    color: "#CD5C5C",
    groundColor: "#A0522D",
    skyColor: "#E27B58",
    description: "The Red Planet with about 38% of Earth's gravity",
    mass: "6.42 × 10²³ kg",
    radius: "3,390 km",
    scientificExplanation: "Mars has about 38% of Earth's gravity due to its smaller mass (only 11% of Earth's mass) and smaller radius (about half of Earth's). The combination of lower mass and smaller size results in weaker surface gravity."
  },
  jupiter: {
    name: "Jupiter",
    gravity: 24.79,
    color: "#DAA520",
    groundColor: "#8B7355",
    skyColor: "#FFA500",
    description: "Gas giant with the strongest gravity",
    mass: "1.90 × 10²⁷ kg",
    radius: "69,911 km",
    scientificExplanation: "Jupiter has the strongest gravity in our solar system because it's the most massive planet (318 times Earth's mass). Although it's much larger, its enormous mass more than compensates, creating gravity 2.5 times stronger than Earth's at its cloud tops."
  },
  saturn: {
    name: "Saturn",
    gravity: 10.44,
    color: "#F4A460",
    groundColor: "#D2691E",
    skyColor: "#FFD700",
    description: "Ringed planet with gravity similar to Earth",
    mass: "5.68 × 10²⁶ kg",
    radius: "58,232 km",
    scientificExplanation: "Saturn has gravity similar to Earth despite being much larger because it's a gas giant with low density. Its mass is 95 times Earth's, but its radius is 9.5 times larger, so the effects nearly cancel out, resulting in just slightly stronger gravity."
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
