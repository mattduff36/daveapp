"use client";

import { useState, useTransition } from "react";
import { Download, Mail, Printer } from "lucide-react";
import {
  generateReportDraftAction,
  saveReportEditsAction,
  updateSurveyStepAction,
} from "@/lib/actions/survey-actions";
import type { CompanySettings, Survey, SurveyArea, SurveyPhoto } from "@/lib/survey/types";
import { ReportPreview } from "@/components/survey/report-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReviewReportStepProps {
  survey: Survey;
  areas: SurveyArea[];
  photos: SurveyPhoto[];
  photoUrls: Record<string, string>;
  company: CompanySettings | null;
  hasDefaultEmail: boolean;
}

export function ReviewReportStep({
  survey,
  areas,
  photos,
  photoUrls,
  company,
  hasDefaultEmail,
}: ReviewReportStepProps) {
  const [executiveSummary, setExecutiveSummary] = useState(
    survey.executive_summary || "",
  );
  const [introduction, setIntroduction] = useState(survey.introduction || "");
  const [conclusions, setConclusions] = useState(survey.conclusions || "");
  const [recommendations, setRecommendations] = useState(
    survey.recommendations || "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const uncoveredAreas = areas.filter((area) => !area.condition_rating);
  const previewSurvey: Survey = {
    ...survey,
    executive_summary: executiveSummary,
    introduction,
    conclusions,
    recommendations,
  };

  function generateReport() {
    startTransition(async () => {
      const result = await generateReportDraftAction(survey.id);
      if (result?.error) {
        setMessage(result.error);
        return;
      }

      if (result?.draft) {
        setExecutiveSummary(result.draft.executive_summary);
        setIntroduction(result.draft.introduction);
        setConclusions(result.draft.conclusions);
        setRecommendations(result.draft.recommendations);
      }

      setMessage("Report draft generated.");
    });
  }

  function saveEdits() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("surveyId", survey.id);
      formData.set("executiveSummary", executiveSummary);
      formData.set("introduction", introduction);
      formData.set("conclusions", conclusions);
      formData.set("recommendations", recommendations);
      formData.set("currentStep", "3");
      formData.set("status", "complete");

      const result = await saveReportEditsAction(formData);
      setMessage(result?.error ? result.error : "Report saved.");
    });
  }

  async function exportWord() {
    await saveEdits();
    window.open(`/api/surveys/${survey.id}/export`, "_blank");
  }

  async function emailReport() {
    setMessage("Sending report...");
    const response = await fetch(`/api/surveys/${survey.id}/email`, {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error || "Unable to send report.");
      return;
    }

    setMessage("Report emailed successfully.");
  }

  function goToReviewStep() {
    startTransition(async () => {
      await updateSurveyStepAction(survey.id, 3);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="print-hidden">
        <CardHeader>
          <CardTitle>Coverage checklist</CardTitle>
          <CardDescription>
            Confirm all selected areas have been inspected before generating the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-data text-sm">
            {areas.length - uncoveredAreas.length}/{areas.length} areas rated
          </p>
          {uncoveredAreas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {uncoveredAreas.map((area) => (
                <Badge key={area.id} className="bg-accent/10 text-accent-foreground">
                  {area.name} not rated
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-primary">All areas have condition ratings.</p>
          )}
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending}
            onClick={goToReviewStep}
            type="button"
            variant="outline"
          >
            Mark review step active
          </Button>
        </CardContent>
      </Card>

      <Card className="print-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Edit narrative sections</CardTitle>
              <CardDescription>
                Generate the report draft, then refine the summary sections below.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending}
                onClick={generateReport}
                type="button"
              >
                Generate report
              </Button>
              <Button
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending}
                onClick={saveEdits}
                type="button"
                variant="outline"
              >
                Save edits
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="executiveSummary">Executive summary</Label>
              <Textarea
                className="min-h-28 text-base sm:text-sm"
                id="executiveSummary"
                onChange={(event) => setExecutiveSummary(event.target.value)}
                value={executiveSummary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                className="min-h-28 text-base sm:text-sm"
                id="introduction"
                onChange={(event) => setIntroduction(event.target.value)}
                value={introduction}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conclusions">Conclusions</Label>
              <Textarea
                className="min-h-28 text-base sm:text-sm"
                id="conclusions"
                onChange={(event) => setConclusions(event.target.value)}
                value={conclusions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                className="min-h-28 text-base sm:text-sm"
                id="recommendations"
                onChange={(event) => setRecommendations(event.target.value)}
                value={recommendations}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="print-report">
        <ReportPreview
          areas={areas}
          company={company}
          photoUrls={photoUrls}
          photos={photos}
          survey={previewSurvey}
        />
      </div>

      <Card className="print-hidden">
        <CardHeader>
          <CardTitle>Export report</CardTitle>
          <CardDescription>
            Download, email, or print the full report including all room and elevation notes and photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={exportWord}
              type="button"
            >
              <Download className="h-4 w-4" />
              Export to Word
            </Button>
            {hasDefaultEmail ? (
              <Button
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending}
                onClick={emailReport}
                type="button"
                variant="secondary"
              >
                <Mail className="h-4 w-4" />
                Email report
              </Button>
            ) : null}
            <Button
              className="min-h-11 w-full sm:w-auto"
              onClick={() => window.print()}
              type="button"
              variant="outline"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
