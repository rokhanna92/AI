import { ChevronLeft, ChevronRight, FileDown, CheckCircle2, Loader2 } from "lucide-react";
import type { StepDef, ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface StepWizardProps {
  steps: StepDef[];
  currentStep: number;
  setCurrentStep: (n: number) => void;
  children: React.ReactNode;
  onFinish: () => void | Promise<void>;
  onBack: () => void;
  tc: ThemeConfig;
  canProceed?: boolean;
  isGenerating?: boolean;
}

export function StepWizard({ steps, currentStep, setCurrentStep, children, onFinish, onBack, tc, canProceed = true, isGenerating = false }: StepWizardProps) {
  return (
    <div>
      {/* HUD Timeline */}
      <div className="mb-8 overflow-x-auto pb-2" style={{ paddingTop: "1.2rem" }}>
        <div className="flex items-center min-w-max">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(i)}
                className="flex flex-col items-center gap-1.5 group transition-all"
                style={{ minWidth: 80 }}
              >
                <div
                  className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: i === currentStep ? tc.stepActiveBg : i < currentStep ? tc.stepDoneBg : "rgba(128,128,128,0.06)",
                    border: `1.5px solid ${i === currentStep ? tc.stepActive : i < currentStep ? tc.stepDone : tc.stepInactive}`,
                    boxShadow: i === currentStep ? `0 0 16px ${tc.stepActive}33` : "none",
                  }}
                >
                  {i < currentStep ? (
                    <CheckCircle2 size={15} color={tc.stepDone} />
                  ) : (
                    <span className="text-xs" style={{ color: i === currentStep ? tc.stepActive : tc.stepInactive }}>
                      {s.icon}
                    </span>
                  )}
                  {i === currentStep && (
                    <div
                      className="absolute -inset-1 rounded-full animate-ping opacity-20"
                      style={{ background: tc.stepActive, animationDuration: "2s" }}
                    />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-colors"
                    style={{
                      color: i === currentStep ? tc.stepActive : i < currentStep ? tc.stepDone : tc.stepInactive,
                      fontFamily: FONT.mono,
                    }}
                  >
                    {s.label}
                  </span>
                  {s.tableRef && (
                    <span className="text-[8px] tracking-wide" style={{ color: tc.stepInactive, fontFamily: FONT.mono }}>
                      {s.tableRef}
                    </span>
                  )}
                </div>
              </button>
              {i < steps.length - 1 && (
                <div
                  className="mx-2 h-px w-8 flex-shrink-0"
                  style={{
                    background: i < currentStep
                      ? `linear-gradient(90deg, ${tc.stepDone}99, ${tc.stepDone}44)`
                      : tc.wizardNavBorder,
                    boxShadow: i < currentStep ? `0 0 4px ${tc.stepDone}44` : "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>{children}</div>

      {/* Navigation */}
      <div
        className="flex justify-between mt-8 pt-5"
        style={{ borderTop: `1px solid ${tc.wizardNavBorder}` }}
      >
        <button
          onClick={currentStep === 0 ? onBack : () => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            color: tc.btnPrimaryText,
            border: `1px solid ${tc.btnPrimaryBorder}`,
            background: "transparent",
            fontFamily: FONT.sans,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = tc.btnPrimaryHoverBg;
            (e.currentTarget as HTMLElement).style.borderColor = tc.accent;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = tc.btnPrimaryBorder;
          }}
        >
          <ChevronLeft size={16} />
          {currentStep === 0 ? "Model" : "Prethodni"}
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => canProceed && setCurrentStep(currentStep + 1)}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: canProceed ? tc.btnPrimaryBg : "rgba(128,128,128,0.12)",
              border: `1px solid ${canProceed ? tc.btnPrimaryBorder : "rgba(128,128,128,0.2)"}`,
              color: canProceed ? tc.btnPrimaryText : "rgba(128,128,128,0.5)",
              boxShadow: canProceed ? `0 0 20px ${tc.accent}1a` : "none",
              fontFamily: FONT.sans,
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
            onMouseEnter={e => {
              if (!canProceed) return;
              (e.currentTarget as HTMLElement).style.background = tc.btnPrimaryHoverBg;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${tc.accent}33`;
            }}
            onMouseLeave={e => {
              if (!canProceed) return;
              (e.currentTarget as HTMLElement).style.background = tc.btnPrimaryBg;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${tc.accent}1a`;
            }}
          >
            Sledeća <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={isGenerating ? undefined : onFinish}
            disabled={isGenerating}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black transition-all relative overflow-hidden"
            style={{
              background: isGenerating
                ? "rgba(128,128,128,0.15)"
                : "linear-gradient(135deg, rgba(255,222,0,0.9), rgba(229,200,0,0.9))",
              color: isGenerating ? "rgba(128,128,128,0.6)" : "#0a2206",
              boxShadow: isGenerating ? "none" : "0 0 30px rgba(255,222,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
              border: isGenerating ? "1px solid rgba(128,128,128,0.2)" : "1px solid rgba(255,222,0,0.6)",
              fontFamily: FONT.sans,
              cursor: isGenerating ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => {
              if (isGenerating) return;
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(255,222,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)";
            }}
            onMouseLeave={e => {
              if (isGenerating) return;
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(255,222,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)";
            }}
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> AI генерише…</>
            ) : (
              <><FileDown size={16} /> Generiši PDF</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
