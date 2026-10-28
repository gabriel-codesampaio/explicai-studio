import type { ManualSummary } from "../../lib/api";

interface Props {
  manuals: ManualSummary[];
  current: string | null;
  onChange: (slug: string) => void;
}

export function ManualPicker({ manuals, current, onChange }: Props) {
  return (
    <label className="manual-picker">
      <span>Manual</span>
      <select value={current ?? ""} onChange={(e) => onChange(e.target.value)}>
        {manuals.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.title}
          </option>
        ))}
      </select>
    </label>
  );
}
