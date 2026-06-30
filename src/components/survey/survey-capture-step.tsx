"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Camera, Mic, MicOff, Trash2, Upload } from "lucide-react";
import {
  deleteSurveyPhotoAction,
  saveAreaObservationAction,
  uploadSurveyPhotoAction,
} from "@/lib/actions/survey-actions";
import { CONDITION_RATINGS } from "@/lib/survey/constants";
import type { ConditionRating, SurveyArea, SurveyPhoto } from "@/lib/survey/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SurveyCaptureStepProps {
  surveyId: string;
  areas: SurveyArea[];
  photos: SurveyPhoto[];
  photoUrls: Record<string, string>;
  onContinue: () => void | Promise<void>;
}

export function SurveyCaptureStep({
  surveyId,
  areas,
  photos,
  photoUrls,
  onContinue,
}: SurveyCaptureStepProps) {
  const [activeAreaId, setActiveAreaId] = useState(areas[0]?.id ?? "");
  const [notesByArea, setNotesByArea] = useState<Record<string, string>>(() =>
    Object.fromEntries(areas.map((area) => [area.id, area.notes || ""])),
  );
  const [ratingsByArea, setRatingsByArea] = useState<
    Record<string, ConditionRating | "">
  >(() =>
    Object.fromEntries(
      areas.map((area) => [area.id, area.condition_rating || ""]),
    ),
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isListening, setIsListening] = useState(false);
  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const [isPending, startTransition] = useTransition();

  const activeArea = useMemo(
    () => areas.find((area) => area.id === activeAreaId),
    [areas, activeAreaId],
  );

  const activePhotos = photos.filter((photo) => photo.area_id === activeAreaId);

  useEffect(() => {
    if (!activeAreaId) return;

    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      startTransition(async () => {
        const formData = new FormData();
        formData.set("areaId", activeAreaId);
        formData.set("surveyId", surveyId);
        formData.set("notes", notesByArea[activeAreaId] || "");
        formData.set("conditionRating", ratingsByArea[activeAreaId] || "");
        const result = await saveAreaObservationAction(formData);
        setSaveState(result?.error ? "error" : "saved");
      });
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [activeAreaId, notesByArea, ratingsByArea, surveyId, startTransition]);

  function toggleDictation() {
    if (!speechSupported || !activeAreaId) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (
      event: Event & { results: SpeechRecognitionResultList },
    ) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setNotesByArea((current) => ({
        ...current,
        [activeAreaId]: transcript,
      }));
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }

  function handlePhotoUpload(file: File | null) {
    if (!file || !activeAreaId) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("surveyId", surveyId);
      formData.set("areaId", activeAreaId);
      formData.set("file", file);
      await uploadSurveyPhotoAction(formData);
    });
  }

  function removePhoto(photo: SurveyPhoto) {
    startTransition(async () => {
      await deleteSurveyPhotoAction(photo.id, surveyId, photo.storage_path);
    });
  }

  if (!activeArea) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No areas selected</CardTitle>
          <CardDescription>Return to the areas step to add rooms or elevations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Areas</CardTitle>
          <CardDescription>Select an area to inspect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {areas.map((area) => (
            <button
              key={area.id}
              className={cn(
                "w-full rounded-lg border px-3 py-3 text-left transition",
                activeAreaId === area.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/30",
              )}
              onClick={() => setActiveAreaId(area.id)}
              type="button"
            >
              <p className="font-medium">{area.name}</p>
              <p className="text-xs capitalize opacity-80">{area.area_type}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{activeArea.name}</CardTitle>
              <CardDescription>
                Record condition, notes, voice dictation, and photos for this area.
              </CardDescription>
            </div>
            <Badge className="font-data capitalize">{saveState}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CONDITION_RATINGS.map((rating) => (
              <button
                key={rating.value}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  ratingsByArea[activeArea.id] === rating.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30",
                )}
                onClick={() =>
                  setRatingsByArea((current) => ({
                    ...current,
                    [activeArea.id]: rating.value,
                  }))
                }
                type="button"
              >
                <p className="font-medium">{rating.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rating.description}
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="notes">Observation notes</Label>
              <Button
                disabled={!speechSupported}
                onClick={toggleDictation}
                size="sm"
                type="button"
                variant="outline"
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop dictation
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Voice dictation
                  </>
                )}
              </Button>
            </div>
            {!speechSupported ? (
              <p className="text-xs text-muted-foreground">
                Voice dictation is unavailable in this browser. Text entry remains fully supported.
              </p>
            ) : null}
            <Textarea
              id="notes"
              onChange={(event) =>
                setNotesByArea((current) => ({
                  ...current,
                  [activeArea.id]: event.target.value,
                }))
              }
              value={notesByArea[activeArea.id] || ""}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm">
                <Camera className="h-4 w-4" />
                Take photo
                <input
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) =>
                    handlePhotoUpload(event.target.files?.[0] ?? null)
                  }
                  type="file"
                />
              </Label>
              <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm">
                <Upload className="h-4 w-4" />
                Upload photo
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    handlePhotoUpload(event.target.files?.[0] ?? null)
                  }
                  type="file"
                />
              </Label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {activePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-border bg-muted/40"
                >
                  {photoUrls[photo.storage_path] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={photo.caption || "Survey photo"}
                      className="h-40 w-full object-cover"
                      src={photoUrls[photo.storage_path]}
                    />
                  ) : null}
                  <div className="flex items-center justify-between p-3">
                    <p className="text-xs text-muted-foreground">
                      {photo.caption || "Survey photo"}
                    </p>
                    <Button
                      disabled={isPending}
                      onClick={() => removePhoto(photo)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await onContinue();
              });
            }}
            type="button"
          >
            Continue to review and report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: ((event: Event & { results: SpeechRecognitionResultList }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void;
    };
    webkitSpeechRecognition: Window["SpeechRecognition"];
  }
}
