"use client";

import { cn } from "@/lib/utils";
import { SURVEY_STEPS } from "@/lib/survey/constants";

interface SurveyStepNavProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function SurveyStepNav({ currentStep, onStepClick }: SurveyStepNavProps) {
  return (
    <ol className="grid gap-2 sm:gap-3 md:grid-cols-4">
      {SURVEY_STEPS.map((label, index) => {
        const isActive = currentStep === index;
        const isComplete = currentStep > index;
        const isClickable = Boolean(onStepClick && index <= currentStep);

        return (
          <li key={label}>
            <button
              className={cn(
                "w-full rounded-xl border px-3 py-3 text-left transition sm:px-4",
                isActive && "border-primary bg-primary text-primary-foreground shadow-sm",
                isComplete && !isActive && "border-primary/30 bg-secondary",
                !isActive && !isComplete && "border-border bg-card",
                isClickable && "cursor-pointer hover:border-primary/50",
                !isClickable && "cursor-default",
              )}
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(index)}
              type="button"
            >
              <p className="font-data text-[10px] uppercase tracking-[0.18em] sm:text-xs">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm font-medium sm:text-base">{label}</p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
