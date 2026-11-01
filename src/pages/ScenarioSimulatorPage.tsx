import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ScenarioSimulatorPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [scenarioCategory, setScenarioCategory] = useState('climate_change');

  // Interactive slider controls for the interface preview
  const [tempAnomaly, setTempAnomaly] = useState(1.5);
  const [precipChange, setPrecipChange] = useState(-10);
  const [popGrowth, setPopGrowth] = useState(15);
  const [renewableCap, setRenewableCap] = useState(40);

  const handleReset = () => {
    setTempAnomaly(1.5);
    setPrecipChange(-10);
    setPopGrowth(15);
    setRenewableCap(40);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Forward Stress Testing Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Explore hypothetical climate anomalies, population surges, and clean energy deployment thresholds to identify future resource tipping points.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 block text-center">
              Simulation Engine: Phase 5
            </span>
          </div>
        </div>

        {/* Prominent Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Interactive Prototype Specification: </strong>
            Parameter controls demonstrate the intended simulation inputs. The computational modeling engine will be implemented in Phase 5. No prospective numbers or simulated impacts are being calculated at this stage.
          </div>
        </div>
      </div>

      {/* Simulator Control Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Scenario Parameters Form */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Scenario Parameters
            </h2>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              title="Reset parameters to baseline"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Location Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Location Focus</label>
            <input
              type="text"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              placeholder="e.g. Seville, Andalusia, Spain"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Scenario Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Scenario Archetype</label>
            <select
              value={scenarioCategory}
              onChange={(e) => setScenarioCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="climate_change">IPCC SSP2-4.5 (Moderate Emissions)</option>
              <option value="severe_drought">Severe 2-Year Hydrological Drought</option>
              <option value="clean_transition">Rapid Renewable Electrification (2035)</option>
              <option value="rapid_urbanization">High Urban Population Influx</option>
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            {/* Temperature Anomaly */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Temperature Anomaly:</span>
                <span className="font-mono font-bold text-slate-900">+{tempAnomaly.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={tempAnomaly}
                onChange={(e) => setTempAnomaly(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>0 °C</span>
                <span>+2.0 °C</span>
                <span>+4.0 °C</span>
              </div>
            </div>

            {/* Precipitation Variance */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Precipitation Shift:</span>
                <span className="font-mono font-bold text-slate-900">{precipChange > 0 ? `+${precipChange}` : precipChange}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="5"
                value={precipChange}
                onChange={(e) => setPrecipChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>-40%</span>
                <span>0%</span>
                <span>+40%</span>
              </div>
            </div>

            {/* Population Growth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Population Demand Surge:</span>
                <span className="font-mono font-bold text-slate-900">+{popGrowth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={popGrowth}
                onChange={(e) => setPopGrowth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            {/* Clean Energy Transition Target */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Clean Energy Grid Share:</span>
                <span className="font-mono font-bold text-slate-900">{renewableCap}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={renewableCap}
                onChange={(e) => setRenewableCap(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              disabled
              className="w-full opacity-60 cursor-not-allowed text-xs"
              icon={<Play className="w-3.5 h-3.5" />}
            >
              Run Simulation Model (Phase 5)
            </Button>
          </div>
        </Card>

        {/* Right 2 Cols: Baseline vs Projected Scenario Outcome Areas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Result Area */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Historical Baseline</h3>
                <Badge variant="default" size="sm">Pre-Simulation</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Aquifer Depletion Velocity:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Heat Stress Days (&gt;38°C):</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Peak Grid Transmission Reserve:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Crop Evapotranspiration Deficit:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Baseline indicators populate when location telemetry is resolved in Prompt 2.
              </p>
            </Card>

            {/* Scenario Result Area */}
            <Card className="space-y-3 border-amber-200/70 bg-amber-50/20">
              <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                <h3 className="text-sm font-bold text-amber-950">Projected Scenario</h3>
                <Badge variant="amber" size="sm">Model Projection</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                  <span className="text-slate-700">Projected Aquifer Stress:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                  <span className="text-slate-700">Projected Heat Stress Days:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                  <span className="text-slate-700">Projected Grid Stress Delta:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                  <span className="text-slate-700">Agro Yield Deviation:</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-800/80 italic">
                Awaiting mathematical calculation models in Phase 5.
              </p>
            </Card>
          </div>

          {/* Assumptions & Limitations */}
          <Card variant="subtle" className="text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 border-b border-slate-200/80 pb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Simulation Modeling Assumptions & Uncertainty Bounds</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                Projections will utilize CMIP6 ensemble models downscaled via Copernicus Climate Data Store.
              </li>
              <li>
                Socioeconomic feedback loops assume constant infrastructure investment velocity unless explicitly adjusted in policy parameters.
              </li>
              <li>
                Model outputs represent exploratory stress testing, not deterministic predictions.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
