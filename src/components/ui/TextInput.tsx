import type { InputHTMLAttributes } from 'react';
import { InfoTooltip } from './InfoTooltip';

export type TextInputProps = {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  infoText?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'>;

export function TextInput({
  label,
  id,
  value,
  onChange,
  infoText,
  className = '',
  ...rest
}: TextInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1">
        <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </label>
        {infoText ? <InfoTooltip title={label} description={infoText} side="left" /> : null}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 ${className}`}
        {...rest}
      />
    </div>
  );
}
