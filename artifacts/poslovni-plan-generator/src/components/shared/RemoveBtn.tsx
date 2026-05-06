import { X } from "lucide-react";

interface RemoveBtnProps {
  onClick: () => void;
}

export function RemoveBtn({ onClick }: RemoveBtnProps) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded flex items-center justify-center transition-all"
      style={{ color: "rgba(239,68,68,0.5)", background: "transparent" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = "#ef4444";
        (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.5)";
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <X size={13} />
    </button>
  );
}
