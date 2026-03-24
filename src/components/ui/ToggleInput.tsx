import { InfoTooltip } from './InfoTooltip';

export type ToggleInputProps = {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  infoText?: string;
};

export function ToggleInput({ label, id, checked, onChange, infoText }: ToggleInputProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="inline-flex items-center gap-1">
        <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </label>
        {infoText ? <InfoTooltip title={label} description={infoText} side="left" /> : null}
      </span>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-emerald-600' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
