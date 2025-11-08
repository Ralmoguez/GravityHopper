import { useEffect, useMemo, useState } from "react";
import { useGravityGame, PLANETS } from "@/lib/stores/useGravityGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Volume2, VolumeX, Info, BarChart3 } from "lucide-react";
import { ComparisonChart } from "./ComparisonChart";

export function GameUI() {
  const {
    selectedPlanet,
    playerMass,
    setSelectedPlanet,
    setPlayerMass,
    getCurrentPlanet,
    getWeight,
    getEarthWeight,
    getGravityRatio,
    getJumpHeight,
    getHangTime,
  } = useGravityGame();
  const { isMuted, toggleMute } = useAudio();
  const [showComparison, setShowComparison] = useState(false);
  const [massInput, setMassInput] = useState(playerMass.toString());

  const planet = getCurrentPlanet();
  const weight = getWeight();
  const earthWeight = getEarthWeight();
  const gravityRatio = getGravityRatio();
  const jumpHeight = getJumpHeight();
  const hangTime = getHangTime();
  const weightRatio = earthWeight === 0 ? 0 : weight / earthWeight;
  const weightDifference = weight - earthWeight;
  const weightDescriptor = weightRatio >= 1 ? "heavier" : "lighter";
  const maxWeight = Math.max(weight, earthWeight);
  const massWarning = massInput.trim() === "";

  useEffect(() => {
    setMassInput(playerMass.toString());
  }, [playerMass]);

  const handleMassChange = (value: string) => {
    if (value.length > 6) return;
    setMassInput(value);
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      setPlayerMass(parsed);
    }
  };

  const handleMassBlur = () => {
    const parsed = Number(massInput);
    if (Number.isNaN(parsed) || parsed < 1) {
      setMassInput(playerMass.toString());
      return;
    }

    const clamped = Math.min(Math.max(parsed, 1), 500);
    setPlayerMass(clamped);
    setMassInput(clamped.toString());
  };

  const weightComparison = useMemo(() => {
    if (maxWeight === 0) {
      return { earth: 0, planet: 0 };
    }
    return {
      earth: (earthWeight / maxWeight) * 100,
      planet: (weight / maxWeight) * 100,
    };
  }, [earthWeight, maxWeight, weight]);

  return (
    <>
      {showComparison && <ComparisonChart onClose={() => setShowComparison(false)} />}
      
      <div className="absolute top-4 left-4 z-10 space-y-4 max-w-sm">
        <Card className="p-6 bg-white/95 backdrop-blur shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Gravity Jump</h1>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComparison(true)}
                className="text-gray-900"
                title="Compare jump heights"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-gray-900"
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="planet-select" className="text-gray-900 font-semibold">Select Planet</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <Info className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-white text-gray-900 p-4">
                    <div className="space-y-2">
                      <h4 className="font-bold">{planet.name}</h4>
                      <p className="text-xs"><span className="font-semibold">Mass:</span> {planet.mass}</p>
                      <p className="text-xs"><span className="font-semibold">Radius:</span> {planet.radius}</p>
                      <p className="text-xs mt-2">{planet.scientificExplanation}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="mass-input" className="text-gray-900 font-semibold flex items-center justify-between">
              Your Mass (kg)
              <span className="text-xs font-normal text-gray-500">Mass never changes between planets</span>
            </Label>
            <Input
              id="mass-input"
              type="number"
              min="1"
              max="500"
              step="0.5"
              value={massInput}
              onChange={(e) => handleMassChange(e.target.value)}
              onBlur={handleMassBlur}
              className="bg-white text-gray-900"
              placeholder="Enter your mass in kg"
            />
            {massWarning && (
              <p className="text-xs text-amber-600">Enter a positive value to update the simulation.</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Physics Info</h3>
              <div className="space-y-1 text-sm text-gray-800">
                <p><span className="font-semibold">Planet:</span> {planet.name}</p>
                <p><span className="font-semibold">Gravity:</span> {planet.gravity.toFixed(2)} m/s² ({gravityRatio.toFixed(2)}× Earth's g)</p>
                <p><span className="font-semibold">Mass:</span> {playerMass.toFixed(1)} kg</p>
                <p><span className="font-semibold">Weight here:</span> {weight.toFixed(2)} N</p>
                <p><span className="font-semibold">Weight on Earth:</span> {earthWeight.toFixed(2)} N</p>
                <p><span className="font-semibold">Jump height:</span> {jumpHeight.toFixed(2)} m</p>
                <p><span className="font-semibold">Hang time:</span> {hangTime.toFixed(2)} s</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded border border-blue-300 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-900">
                <span>W = m × g</span>
                <span>{weight.toFixed(2)} N</span>
              </div>
              <p className="text-xs font-mono text-gray-900">
                {weight.toFixed(2)} N = {playerMass.toFixed(1)} kg × {planet.gravity.toFixed(2)} m/s²
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Earth</span>
                  <span>{earthWeight.toFixed(1)} N</span>
                </div>
                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${weightComparison.earth}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{planet.name}</span>
                  <span>{weight.toFixed(1)} N</span>
                </div>
                <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${weightComparison.planet}%` }}
                  />
                </div>
                <p className="text-xs text-gray-700">
                  You feel {Math.abs(weightDifference).toFixed(1)} N {weightDescriptor} than on Earth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-purple-100/95 backdrop-blur shadow-xl">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <div className="text-sm text-gray-800 space-y-1">
          <p>🚀 Press <kbd className="px-2 py-1 bg-white rounded border border-gray-400 font-bold">SPACEBAR</kbd> to jump!</p>
          <p>⚖️ Your mass stays the same everywhere, but weight changes with gravity.</p>
          <p>📊 Lower gravity = Higher jumps</p>
          <p>🌍 Try different planets to see how gravity affects your jump height!</p>
        </div>
      </Card>
      </div>
    </>
  );
}
