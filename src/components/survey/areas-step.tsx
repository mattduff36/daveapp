"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addSurveyAreaAction,
  removeSurveyAreaAction,
  updateSurveyStepAction,
} from "@/lib/actions/survey-actions";
import {
  EXTERNAL_AREA_PRESETS,
  INTERNAL_AREA_PRESETS,
} from "@/lib/survey/constants";
import type { SurveyArea } from "@/lib/survey/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AreasStepProps {
  surveyId: string;
  areas: SurveyArea[];
  onContinue: () => void;
}

export function AreasStep({ surveyId, areas, onContinue }: AreasStepProps) {
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"internal" | "external">("internal");
  const [isPending, startTransition] = useTransition();

  function addPreset(name: string, areaType: "internal" | "external") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("surveyId", surveyId);
      formData.set("name", name);
      formData.set("areaType", areaType);
      await addSurveyAreaAction(formData);
    });
  }

  function addCustomArea() {
    if (!customName.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("surveyId", surveyId);
      formData.set("name", customName.trim());
      formData.set("areaType", customType);
      await addSurveyAreaAction(formData);
      setCustomName("");
    });
  }

  function removeArea(areaId: string) {
    startTransition(async () => {
      await removeSurveyAreaAction(areaId, surveyId);
    });
  }

  function continueToSurvey() {
    startTransition(async () => {
      await updateSurveyStepAction(surveyId, 2);
      onContinue();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select rooms and elevations</CardTitle>
          <CardDescription>
            Tap presets or add custom areas to build the inspection checklist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium">Internal rooms</p>
            <div className="flex flex-wrap gap-2">
              {INTERNAL_AREA_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  disabled={isPending}
                  onClick={() => addPreset(preset, "internal")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">External elevations</p>
            <div className="flex flex-wrap gap-2">
              {EXTERNAL_AREA_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  disabled={isPending}
                  onClick={() => addPreset(preset, "external")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <Input
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Custom area name"
              value={customName}
            />
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              onChange={(event) =>
                setCustomType(event.target.value as "internal" | "external")
              }
              value={customType}
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
            <Button disabled={isPending} onClick={addCustomArea} type="button">
              Add custom
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inspection list</CardTitle>
          <CardDescription>{areas.length} areas selected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {areas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add at least one room or elevation to continue.
            </p>
          ) : (
            areas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{area.name}</p>
                  <Badge className="mt-1 capitalize">{area.area_type}</Badge>
                </div>
                <Button
                  disabled={isPending}
                  onClick={() => removeArea(area.id)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))
          )}

          <Button
            disabled={isPending || areas.length === 0}
            onClick={continueToSurvey}
            type="button"
          >
            Continue to survey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
