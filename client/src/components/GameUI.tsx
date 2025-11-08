import { useGravityGame, PLANETS } from "@/lib/stores/useGravityGame";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function GameUI() {
  const { selectedPlanet, playerMass, setSelectedPlanet, setPlayerMass, getCurrentPlanet, getWeight } = useGravityGame();
  
  const planet = getCurrentPlanet();
  const weight = getWeight();

  return (
    <div className="absolute top-4 left-4 z-10 space-y-4 max-w-sm">
      <Card className="p-6 bg-white/95 backdrop-blur shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Gravity Jump</h1>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="planet-select" className="text-gray-900 font-semibold">Select Planet</Label>
            <Select value={selectedPlanet} onValueChange={setSelectedPlanet}>
              <SelectTrigger id="planet-select" className="mt-1 bg-white text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.entries(PLANETS).map(([key, planet]) => (
                  <SelectItem key={key} value={key} className="text-gray-900">
                    {planet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-700 mt-1">{planet.description}</p>
          </div>

          <div>
            <Label htmlFor="mass-input" className="text-gray-900 font-semibold">Your Mass (kg)</Label>
            <Input
              id="mass-input"
              type="number"
              min="1"
              max="200"
              value={playerMass}
              onChange={(e) => setPlayerMass(Number(e.target.value) || 70)}
              className="mt-1 bg-white text-gray-900"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Physics Info</h3>
            <div className="space-y-1 text-sm text-gray-800">
              <p><span className="font-semibold">Planet:</span> {planet.name}</p>
              <p><span className="font-semibold">Gravity:</span> {planet.gravity.toFixed(2)} m/s²</p>
              <p><span className="font-semibold">Mass:</span> {playerMass} kg</p>
              <p><span className="font-semibold">Weight:</span> {weight.toFixed(2)} N</p>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-blue-300">
              <p className="text-xs font-mono text-gray-900">W = m × g</p>
              <p className="text-xs font-mono text-gray-900">
                {weight.toFixed(2)} N = {playerMass} kg × {planet.gravity.toFixed(2)} m/s²
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-purple-100/95 backdrop-blur shadow-xl">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <div className="text-sm text-gray-800 space-y-1">
          <p>🚀 Press <kbd className="px-2 py-1 bg-white rounded border border-gray-400 font-bold">SPACEBAR</kbd> to jump!</p>
          <p>📊 Lower gravity = Higher jumps</p>
          <p>🌍 Try different planets to see how gravity affects your jump height!</p>
        </div>
      </Card>
    </div>
  );
}
