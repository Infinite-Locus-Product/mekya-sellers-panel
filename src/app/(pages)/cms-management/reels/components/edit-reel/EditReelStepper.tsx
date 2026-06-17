import { cn } from "@/lib/utils";
import { EDIT_FLOW_STEPS } from "../../lib/constants";

export interface EditReelStepperProps {
  editStep: number;
  onStepClick?: (index: number) => void;
}

const LAST_INDEX = EDIT_FLOW_STEPS.length - 1;

export function EditReelStepper({ editStep, onStepClick }: Readonly<EditReelStepperProps>) {
  return (
    <div className="shrink-0 border-b border-[#E8E9E8] bg-white px-4 pb-5 pt-5 sm:px-6">
      <div className="flex w-full items-stretch">
        {EDIT_FLOW_STEPS.map((step, index) => (
          <div
            key={step.label}
            className="relative flex min-w-0 flex-1 basis-0 flex-col items-center gap-2"
            aria-current={index === editStep ? "step" : undefined}
          >
            <span className={cn(
              "w-full text-center text-[10px] font-medium leading-tight sm:text-xs",
              index === editStep ? "text-[#004C5E]" : "text-[#2A2A2A]"
            )}>
              {step.label}
            </span>
            {index < LAST_INDEX ? (
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-[calc(100%-1.25rem)] z-0 block h-0.5 w-full -translate-y-1/2 rounded-full sm:h-[3px]",
                  editStep > index ? "bg-[#5BD387]" : "bg-[#E5E5E5]"
                )}
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              aria-label={`Go to ${step.label}`}
              onClick={() => onStepClick?.(index)}
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C5E] focus-visible:ring-offset-2",
                index <= editStep ? "bg-[#5BD387] hover:brightness-95" : "bg-[#E5E5E5] hover:bg-[#D4D4D4]",
                !onStepClick && "cursor-default"
              )}
            >
              <step.Icon className="size-5 text-black" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
