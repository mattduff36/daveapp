"use client";

import { useRef, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Trash2,
  Upload,
} from "lucide-react";
import {
  deleteSurveyPhotoAction,
  saveAreaObservationAction,
  updateSurveyPhotoCaptionAction,
  uploadSurveyPhotoAction,
} from "@/lib/actions/survey-actions";
import { CONDITION_RATINGS } from "@/lib/survey/constants";
import { resolvePhotoUrl } from "@/lib/survey/photos";
import type { ConditionRating, SurveyArea, SurveyPhoto } from "@/lib/survey/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const router = useRouter();
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
  const [captionsByPhoto, setCaptionsByPhoto] = useState<Record<string, string>>(() =>
    Object.fromEntries(photos.map((photo) => [photo.id, photo.caption || ""])),
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<InstanceType<
    NonNullable<typeof window.SpeechRecognition>
  > | null>(null);
  const dictationBaseRef = useRef("");
  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const [isPending, startTransition] = useTransition();

  const activeIndex = useMemo(
    () => areas.findIndex((area) => area.id === activeAreaId),
    [areas, activeAreaId],
  );

  const activeArea = areas[activeIndex];
  const activePhotos = photos.filter((photo) => photo.area_id === activeAreaId);
  const hasPreviousArea = activeIndex > 0;
  const hasNextArea = activeIndex >= 0 && activeIndex < areas.length - 1;

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

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  function stopDictation() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }

  function toggleDictation() {
    if (!speechSupported || !activeAreaId) return;

    if (isListening) {
      stopDictation();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    dictationBaseRef.current = notesByArea[activeAreaId] || "";
    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (
      event: Event & { resultIndex: number; results: SpeechRecognitionResultList },
    ) => {
      let finalTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal) {
          finalTranscript += result[0]?.transcript ?? "";
        }
      }

      if (!finalTranscript.trim()) return;

      setNotesByArea((current) => {
        const existing = current[activeAreaId] ?? dictationBaseRef.current;
        const separator =
          existing.length > 0 && !existing.endsWith(" ") ? " " : "";
        const updated = `${existing}${separator}${finalTranscript.trim()}`;
        dictationBaseRef.current = updated;
        return {
          ...current,
          [activeAreaId]: updated,
        };
      });
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onerror = () => stopDictation();

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
      router.refresh();
    });
  }

  function removePhoto(photo: SurveyPhoto) {
    startTransition(async () => {
      await deleteSurveyPhotoAction(
        photo.id,
        surveyId,
        photo.storage_path,
        photo.cloudinary_public_id,
      );
      router.refresh();
    });
  }

  function savePhotoCaption(photoId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("photoId", photoId);
      formData.set("surveyId", surveyId);
      formData.set("caption", captionsByPhoto[photoId] || "");
      await updateSurveyPhotoCaptionAction(formData);
      router.refresh();
    });
  }

  function goToArea(index: number) {
    stopDictation();
    const nextArea = areas[index];
    if (nextArea) {
      setActiveAreaId(nextArea.id);
    }
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
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Areas</CardTitle>
          <CardDescription>Jump directly to any room or elevation</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto">
          {areas.map((area, index) => (
            <button
              key={area.id}
              className={cn(
                "min-h-11 w-full rounded-lg border px-3 py-3 text-left transition",
                activeAreaId === area.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/30",
              )}
              onClick={() => goToArea(index)}
              type="button"
            >
              <p className="font-medium">{area.name}</p>
              <p className="text-xs capitalize opacity-80">{area.area_type}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{activeArea.name}</CardTitle>
                <CardDescription>
                  {activeIndex + 1} of {areas.length} · Record condition, notes, dictation, and photos.
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
                    "min-h-[88px] rounded-xl border p-4 text-left transition",
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label htmlFor="notes">Observation notes</Label>
                <Button
                  className="min-h-11"
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
                className="min-h-32 text-base sm:text-sm"
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
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm sm:py-2">
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
                <Label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm sm:py-2">
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
                {activePhotos.map((photo) => {
                  const url = resolvePhotoUrl(photo, photoUrls);

                  return (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-xl border border-border bg-muted/40"
                    >
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={photo.caption || "Survey photo"}
                          className="h-40 w-full object-cover"
                          src={url}
                        />
                      ) : null}
                      <div className="space-y-3 p-3">
                        <Input
                          className="h-11 text-base sm:h-10 sm:text-sm"
                          onChange={(event) =>
                            setCaptionsByPhoto((current) => ({
                              ...current,
                              [photo.id]: event.target.value,
                            }))
                          }
                          placeholder="Photo caption"
                          value={captionsByPhoto[photo.id] || ""}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            className="min-h-11 flex-1 sm:flex-none"
                            disabled={isPending}
                            onClick={() => savePhotoCaption(photo.id)}
                            size="sm"
                            type="button"
                            variant="secondary"
                          >
                            Save caption
                          </Button>
                          <Button
                            className="min-h-11"
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
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                className="min-h-11 lg:hidden"
                disabled={!hasPreviousArea}
                onClick={() => goToArea(activeIndex - 1)}
                type="button"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous area
              </Button>
              <Button
                className="min-h-11 lg:hidden"
                disabled={!hasNextArea}
                onClick={() => goToArea(activeIndex + 1)}
                type="button"
                variant="outline"
              >
                Next area
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                className="min-h-11 w-full sm:ml-auto sm:w-auto"
                disabled={isPending}
                onClick={() => {
                  stopDictation();
                  startTransition(async () => {
                    await onContinue();
                  });
                }}
                type="button"
              >
                Continue to review and report
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Button
              className="min-h-11 flex-1"
              disabled={!hasPreviousArea}
              onClick={() => goToArea(activeIndex - 1)}
              type="button"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="min-w-0 px-2 text-center">
              <p className="truncate text-sm font-medium">{activeArea.name}</p>
              <p className="text-xs text-muted-foreground">
                {activeIndex + 1} of {areas.length}
              </p>
            </div>
            <Button
              className="min-h-11 flex-1"
              disabled={!hasNextArea}
              onClick={() => goToArea(activeIndex + 1)}
              type="button"
              variant="outline"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult:
        | ((
            event: Event & {
              resultIndex: number;
              results: SpeechRecognitionResultList;
            },
          ) => void)
        | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    webkitSpeechRecognition: Window["SpeechRecognition"];
  }
}
