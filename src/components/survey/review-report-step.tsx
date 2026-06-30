"use client";

import { useState, useTransition } from "react";
import { Download, Mail, Printer } from "lucide-react";
import {
  generateReportDraftAction,
  saveReportEditsAction,
  updateSurveyStepAction,
} from "@/lib/actions/survey-actions";
import { buildPropertyDescription } from "@/lib/survey/report-text";
import type { Survey, SurveyArea } from "@/lib/survey/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface ReviewReportStepProps {
  survey: Survey;
  areas: SurveyArea[];
  hasDefaultEmail: boolean;
}

export function ReviewReportStep({
  survey,
  areas,
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
      <Card>
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
          <Button disabled={isPending} onClick={goToReviewStep} type="button" variant="outline">
            Mark review step active
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Report builder</CardTitle>
              <CardDescription>
                Generate the full report, then edit conclusions and recommendations before export.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={isPending} onClick={generateReport} type="button">
                Generate report
              </Button>
              <Button disabled={isPending} onClick={saveEdits} type="button" variant="outline">
                Save edits
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

          <section className="font-report space-y-2 rounded-xl border border-border bg-card p-6">
            <h3 className="text-xl font-semibold">Property description</h3>
            <p>{buildPropertyDescription(survey)}</p>
          </section>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="executiveSummary">Executive summary</Label>
              <Textarea
                id="executiveSummary"
                onChange={(event) => setExecutiveSummary(event.target.value)}
                value={executiveSummary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                onChange={(event) => setIntroduction(event.target.value)}
                value={introduction}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conclusions">Conclusions</Label>
              <Textarea
                id="conclusions"
                onChange={(event) => setConclusions(event.target.value)}
                value={conclusions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                onChange={(event) => setRecommendations(event.target.value)}
                value={recommendations}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button disabled={isPending} onClick={exportWord} type="button">
              <Download className="h-4 w-4" />
              Export to Word
            </Button>
            {hasDefaultEmail ? (
              <Button disabled={isPending} onClick={emailReport} type="button" variant="secondary">
                <Mail className="h-4 w-4" />
                Email report
              </Button>
            ) : null}
            <Button onClick={() => window.print()} type="button" variant="outline">
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
