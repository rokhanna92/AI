import type { ThemeConfig } from "../../types";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  table?: string;
  tc: ThemeConfig;
}

export function SectionHeader({ icon: Icon, title, table, tc }: SectionHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 mb-6 pb-4"
      style={{ borderBottom: `1px solid ${tc.sectionHeaderBorder}` }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: tc.sectionIconBg, border: `1px solid ${tc.sectionIconBorder}` }}
      >
        <Icon size={15} color={tc.sectionIconColor} />
      </div>
      <h3 className="font-bold text-sm tracking-wide flex-1" style={{ color: tc.sectionTitleColor }}>
        {title}
      </h3>
      {table && (
        <div
          className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.2em] uppercase"
          style={{
            background: tc.sectionTableChipBg,
            border: `1px solid ${tc.sectionTableChipBorder}`,
            color: tc.sectionTableChipText,
            fontFamily: "Verdana, 'Trebuchet MS', Geneva, sans-serif",
          }}
        >
          {table}
        </div>
      )}
    </div>
  );
}
