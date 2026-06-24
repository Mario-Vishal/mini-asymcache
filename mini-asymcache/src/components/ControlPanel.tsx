import { WORKLOAD_PRESETS } from "../simulator/presets";
import { PolicyName } from "../simulator/types";

interface ControlState {
  workloadType: keyof typeof WORKLOAD_PRESETS;
  numRequests: number;
  capacityMb: number;
  blockSizeTokens: number;
  avgPromptLength: number;
  avgOutputLength: number;
  reuseProbability: number;
  selectedPolicy: PolicyName;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
}

interface Props {
  controls: ControlState;
  onChange: (changes: Partial<ControlState>) => void;
  onRun: () => void;
  onReset: () => void;
}

function RangeInput({
  label,
  min,
  max,
  value,
  step = 1,
  suffix,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="control">
      <span>
        {label}: {value}
        {suffix}
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(evt) => onChange(Number(evt.target.value))} />
    </label>
  );
}

export function ControlPanel({ controls, onChange, onRun, onReset }: Props) {
  const workloadOptions = Object.keys(WORKLOAD_PRESETS) as Array<keyof typeof WORKLOAD_PRESETS>;
  const policyOptions: PolicyName[] = ["LRU", "LFU", "Position-aware", "Latency-aware"];

  return (
    <div className="space-y-4">
      <h2 className="section-title">Simulation controls</h2>
      <label className="control">
        <span>Workload type</span>
        <select value={controls.workloadType} onChange={(evt) => onChange({ workloadType: evt.target.value as ControlState["workloadType"] })}>
          {workloadOptions.map((workload) => (
            <option key={workload} value={workload}>
              {workload}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <RangeInput
          label="Requests"
          min={8}
          max={100}
          value={controls.numRequests}
          onChange={(value) => onChange({ numRequests: value })}
          suffix=""
        />
        <RangeInput
          label="Cache capacity"
          min={64}
          max={1200}
          value={controls.capacityMb}
          onChange={(value) => onChange({ capacityMb: value })}
          suffix="MB"
        />
        <RangeInput
          label="Block size"
          min={64}
          max={1024}
          value={controls.blockSizeTokens}
          onChange={(value) => onChange({ blockSizeTokens: value })}
          suffix="tokens"
        />
        <RangeInput
          label="Reuse probability"
          min={0}
          max={95}
          value={controls.reuseProbability}
          onChange={(value) => onChange({ reuseProbability: value })}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RangeInput
          label="Average prompt"
          min={128}
          max={20000}
          value={controls.avgPromptLength}
          onChange={(value) => onChange({ avgPromptLength: value })}
          suffix="tok"
        />
        <RangeInput
          label="Average output"
          min={64}
          max={1024}
          value={controls.avgOutputLength}
          onChange={(value) => onChange({ avgOutputLength: value })}
          suffix="tok"
        />
      </div>

      <label className="control">
        <span>Eviction policy</span>
        <select value={controls.selectedPolicy} onChange={(evt) => onChange({ selectedPolicy: evt.target.value as PolicyName })}>
          {policyOptions.map((policy) => (
            <option key={policy} value={policy}>
              {policy}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-2 text-xs text-slate-300">Latency-aware weights</div>
      <div className="grid grid-cols-2 gap-3">
        <RangeInput label="alpha (recency)" min={0} max={2} step={0.05} value={controls.alpha} onChange={(v) => onChange({ alpha: v })} />
        <RangeInput label="beta (frequency)" min={0} max={2} step={0.05} value={controls.beta} onChange={(v) => onChange({ beta: v })} />
        <RangeInput label="gamma (recompute)" min={0} max={2} step={0.05} value={controls.gamma} onChange={(v) => onChange({ gamma: v })} />
        <RangeInput label="delta (position)" min={0} max={2} step={0.05} value={controls.delta} onChange={(v) => onChange({ delta: v })} />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={onRun}>
          Run simulation
        </button>
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
