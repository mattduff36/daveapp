"use client";

import { cn } from "@/lib/utils";
import { SURVEY_STEPS } from "@/lib/survey/constants";

interface SurveyStepNavProps {
  currentStep: number;
}

export function SurveyStepNav({ currentStep }: SurveyStepNavProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-4">
      {SURVEY_STEPS.map((label, index) => {
        const isActive = currentStep === index;
        const isComplete = currentStep > index;

        return (
          <li
            key={label}
            className={cn(
              "rounded-xl border px-4 py-3 transition",
              isActive && "border-primary bg-primary text-primary-foreground shadow-sm",
              isComplete && !isActive && "border-primary/30 bg-secondary",
              !isActive && !isComplete && "border-border bg-card",
            )}
          >
            <p className="font-data text-xs uppercase tracking-[0.18em]">
              Step {index + 1}
            </p>
            <p className="mt-1 font-medium">{label}</p>
          </li>
        );
      })}
    </ol>
  );
}
