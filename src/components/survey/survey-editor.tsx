"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSurveyStepAction } from "@/lib/actions/survey-actions";
import type { CompanySettings, SurveyWithRelations } from "@/lib/survey/types";
import { AreasStep } from "@/components/survey/areas-step";
import { PropertyStep } from "@/components/survey/property-step";
import { ReviewReportStep } from "@/components/survey/review-report-step";
import { SurveyCaptureStep } from "@/components/survey/survey-capture-step";
import { SurveyStepNav } from "@/components/survey/survey-step-nav";

interface SurveyEditorProps {
  survey: SurveyWithRelations;
  photoUrls: Record<string, string>;
  company: CompanySettings | null;
}

export function SurveyEditor({ survey, photoUrls, company }: SurveyEditorProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(survey.current_step);
  const [, startTransition] = useTransition();

  function refreshToStep(step: number) {
    setCurrentStep(step);
    router.refresh();
  }

  function navigateToStep(step: number) {
    if (step > currentStep) return;

    startTransition(async () => {
      await updateSurveyStepAction(survey.id, step);
      refreshToStep(step);
    });
  }

  return (
    <div className="space-y-6">
      <SurveyStepNav currentStep={currentStep} onStepClick={navigateToStep} />

      {currentStep === 0 ? (
        <PropertyStep onSaved={() => refreshToStep(1)} survey={survey} />
      ) : null}

      {currentStep === 1 ? (
        <AreasStep
          areas={survey.survey_areas}
          onContinue={() => refreshToStep(2)}
          surveyId={survey.id}
        />
      ) : null}

      {currentStep === 2 ? (
        <SurveyCaptureStep
          areas={survey.survey_areas}
          onContinue={async () => {
            await updateSurveyStepAction(survey.id, 3);
            refreshToStep(3);
          }}
          photoUrls={photoUrls}
          photos={survey.survey_photos}
          surveyId={survey.id}
        />
      ) : null}

      {currentStep === 3 ? (
        <ReviewReportStep
          areas={survey.survey_areas}
          company={company}
          hasDefaultEmail={Boolean(company?.default_report_email)}
          photoUrls={photoUrls}
          photos={survey.survey_photos}
          survey={survey}
        />
      ) : null}
    </div>
  );
}
