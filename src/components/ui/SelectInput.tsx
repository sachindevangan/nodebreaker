import { InfoTooltip } from './InfoTooltip';

export type SelectOption = { value: string; label: string };

export type SelectInputProps = {
  label: string;
  id: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  infoText?: string;
};

export function SelectInput({ label, id, value, options, onChange, infoText }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1">
        <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </label>
        {infoText ? <InfoTooltip title={label} description={infoText} side="left" /> : null}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-950">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
