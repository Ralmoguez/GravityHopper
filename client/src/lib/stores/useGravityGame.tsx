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
  surfaceTexture: string;
  surfaceRepeat: number;
  skyGradient: {
    top: string;
    bottom: string;
  };
  fogColor: string;
  starDensity: number;
  ring?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
    opacity?: number;
    tilt?: number;
  };
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
    scientificExplanation: "Earth's gravity is determined by its mass and radius. The formula g = GM/r² shows that gravity depends on the planet's mass (M) and the square of its radius (r). Earth's moderate mass and size create the familiar 9.81 m/s² we experience daily.",
    surfaceTexture: "/textures/grass.png",
    surfaceRepeat: 32,
    skyGradient: {
      top: "#3b82f6",
      bottom: "#bae6fd",
    },
    fogColor: "#a5d8ff",
    starDensity: 1500,
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
    scientificExplanation: "The Moon has only 1/6th of Earth's gravity because it has much less mass (1/81 of Earth) and a smaller radius. Despite being smaller, the reduced mass has a greater effect, resulting in significantly weaker gravitational pull.",
    surfaceTexture: "/textures/asphalt.png",
    surfaceRepeat: 18,
    skyGradient: {
      top: "#0f172a",
      bottom: "#1f2937",
    },
    fogColor: "#1f2937",
    starDensity: 4000,
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
    scientificExplanation: "Mars has about 38% of Earth's gravity due to its smaller mass (only 11% of Earth's mass) and smaller radius (about half of Earth's). The combination of lower mass and smaller size results in weaker surface gravity.",
    surfaceTexture: "/textures/sand.jpg",
    surfaceRepeat: 22,
    skyGradient: {
      top: "#f97316",
      bottom: "#fed7aa",
    },
    fogColor: "#fcd9b6",
    starDensity: 2200,
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
    scientificExplanation: "Jupiter has the strongest gravity in our solar system because it's the most massive planet (318 times Earth's mass). Although it's much larger, its enormous mass more than compensates, creating gravity 2.5 times stronger than Earth's at its cloud tops.",
    surfaceTexture: "/textures/jupiter-bands.svg",
    surfaceRepeat: 8,
    skyGradient: {
      top: "#b45309",
      bottom: "#fde68a",
    },
    fogColor: "#f1c77d",
    starDensity: 1200,
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
    scientificExplanation: "Saturn has gravity similar to Earth despite being much larger because it's a gas giant with low density. Its mass is 95 times Earth's, but its radius is 9.5 times larger, so the effects nearly cancel out, resulting in just slightly stronger gravity.",
    surfaceTexture: "/textures/saturn-bands.svg",
    surfaceRepeat: 10,
    skyGradient: {
      top: "#fbbf24",
      bottom: "#fef3c7",
    },
    fogColor: "#f7e9c3",
    starDensity: 1600,
    ring: {
      innerRadius: 2.5,
      outerRadius: 4,
      color: "#facc15",
      opacity: 0.55,
      tilt: 0.35,
    },
  }
};

interface GravityGameState {
  selectedPlanet: string;
  playerMass: number;
  isJumping: boolean;
  jumpVelocity: number;

  setSelectedPlanet: (planet: string) => void;
  setPlayerMass: (mass: number) => void;
  setIsJumping: (jumping: boolean) => void;

  getCurrentPlanet: () => Planet;
  getWeight: () => number;
  getEarthWeight: () => number;
  getGravityRatio: () => number;
  getJumpHeight: () => number;
  getHangTime: () => number;
}

export const useGravityGame = create<GravityGameState>((set, get) => ({
  selectedPlanet: "earth",
  playerMass: 70,
  isJumping: false,
  jumpVelocity: 2.7,

  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setPlayerMass: (mass) => {
    const clampedMass = Math.min(Math.max(Math.round(mass * 100) / 100, 1), 500);
    set({ playerMass: clampedMass });
  },
  setIsJumping: (jumping) => set({ isJumping: jumping }),

  getCurrentPlanet: () => {
    const { selectedPlanet } = get();
    return PLANETS[selectedPlanet] ?? PLANETS.earth;
  },

  getWeight: () => {
    const { playerMass } = get();
    const planet = get().getCurrentPlanet();
    return playerMass * planet.gravity;
  },

  getEarthWeight: () => {
    const { playerMass } = get();
    return playerMass * PLANETS.earth.gravity;
  },

  getGravityRatio: () => {
    const planet = get().getCurrentPlanet();
    return planet.gravity / PLANETS.earth.gravity;
  },

  getJumpHeight: () => {
    const { jumpVelocity } = get();
    const planet = get().getCurrentPlanet();
    if (!planet.gravity) {
      return 0;
    }
    return (jumpVelocity * jumpVelocity) / (2 * planet.gravity);
  },

  getHangTime: () => {
    const { jumpVelocity } = get();
    const planet = get().getCurrentPlanet();
    if (!planet.gravity) {
      return 0;
    }
    return (2 * jumpVelocity) / planet.gravity;
  },
}));
