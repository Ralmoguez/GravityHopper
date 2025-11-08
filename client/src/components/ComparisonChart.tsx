import { PLANETS } from "@/lib/stores/useGravityGame";
import { Card } from "./ui/card";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ComparisonChartProps {
  onClose: () => void;
}

export function ComparisonChart({ onClose }: ComparisonChartProps) {
  const jumpVelocity = 8;
  
  const jumpHeights = Object.entries(PLANETS).map(([key, planet]) => ({
    key,
    name: planet.name,
    gravity: planet.gravity,
    maxHeight: (jumpVelocity * jumpVelocity) / (2 * planet.gravity),
    color: planet.color
  }));

  const maxJumpHeight = Math.max(...jumpHeights.map(p => p.maxHeight));

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white/95 backdrop-blur p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Jump Height Comparison</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-sm text-gray-700 mb-6">
          Compare how high you can jump on different planets with the same initial jump velocity (8 m/s).
          Lower gravity means higher jumps!
        </p>

        <div className="space-y-3">
          {jumpHeights.map((planet) => (
            <div key={planet.key} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">{planet.name}</span>
                <span className="text-sm text-gray-700">
                  {planet.maxHeight.toFixed(2)}m ({planet.gravity.toFixed(2)} m/s²)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500"
                  style={{
                    width: `${(planet.maxHeight / maxJumpHeight) * 100}%`,
                    backgroundColor: planet.color
                  }}
                >
                  {planet.maxHeight > maxJumpHeight * 0.3 && `${planet.maxHeight.toFixed(1)}m`}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Physics Formula</h3>
          <p className="text-sm text-gray-800 font-mono">
            Maximum Height = v² / (2g)
          </p>
          <p className="text-xs text-gray-700 mt-2">
            Where v is initial velocity (8 m/s) and g is gravitational acceleration
          </p>
        </div>
      </Card>
    </div>
  );
}
