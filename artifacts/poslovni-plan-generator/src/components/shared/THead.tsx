import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface THeadProps {
  cols: string[];
  tc: ThemeConfig;
}

export function THead({ cols, tc }: THeadProps) {
  return (
    <thead>
      <tr style={{ borderBottom: `1px solid ${tc.accentBorder}` }}>
        {cols.map(c => (
          <th
            key={c}
            className="px-3 py-2.5 text-left text-[10px] font-bold whitespace-nowrap uppercase tracking-[0.15em]"
            style={{ color: tc.tableHeaderText, fontFamily: FONT.mono }}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}
