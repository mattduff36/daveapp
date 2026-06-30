"use client";

import { useState, useTransition } from "react";
import { savePropertyStepAction } from "@/lib/actions/survey-actions";
import {
  ATTACHMENT_TYPES,
  CONSTRUCTION_TYPES,
  GARAGE_TYPES,
  PROPERTY_TYPES,
} from "@/lib/survey/constants";
import type { Survey } from "@/lib/survey/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PropertyStepProps {
  survey: Survey;
  onSaved: () => void;
}

const selectClassName =
  "flex h-11 w-full rounded-md border border-border bg-background px-3 text-base sm:h-10 sm:text-sm";

export function PropertyStep({ survey, onSaved }: PropertyStepProps) {
  const [isPending, startTransition] = useTransition();
  const [hasGarage, setHasGarage] = useState(survey.has_garage ? "yes" : "no");

  function handleSubmit(formData: FormData) {
    formData.set("surveyId", survey.id);
    formData.set("currentStep", "1");
    formData.set("hasGarage", hasGarage);

    if (hasGarage === "no") {
      formData.delete("garageType");
    }

    startTransition(async () => {
      const result = await savePropertyStepAction(formData);
      if (!result?.error) {
        onSaved();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property details</CardTitle>
        <CardDescription>
          Record the core property facts before selecting rooms and elevations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property address</Label>
              <Input
                className="h-11 text-base sm:h-10 sm:text-sm"
                defaultValue={survey.property_address || ""}
                id="propertyAddress"
                name="propertyAddress"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference number</Label>
              <Input
                className="h-11 text-base sm:h-10 sm:text-sm"
                defaultValue={survey.reference_number || ""}
                id="referenceNumber"
                name="referenceNumber"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property type</Label>
              <select
                className={selectClassName}
                defaultValue={survey.property_type || PROPERTY_TYPES[0]}
                id="propertyType"
                name="propertyType"
                required
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeys">Number of storeys</Label>
              <Input
                className="h-11 text-base sm:h-10 sm:text-sm"
                defaultValue={survey.storeys || 2}
                id="storeys"
                min={1}
                name="storeys"
                required
                type="number"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hasGarage">Garage</Label>
              <select
                className={selectClassName}
                id="hasGarage"
                name="hasGarage"
                onChange={(event) => setHasGarage(event.target.value)}
                value={hasGarage}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hasGarage === "yes" ? (
              <div className="space-y-2">
                <Label htmlFor="garageType">Garage type</Label>
                <select
                  className={selectClassName}
                  defaultValue={survey.garage_type || GARAGE_TYPES[0]}
                  id="garageType"
                  name="garageType"
                  required
                >
                  {GARAGE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="attachmentType">Detached / adjoining</Label>
                <select
                  className={selectClassName}
                  defaultValue={survey.attachment_type || ATTACHMENT_TYPES[0]}
                  id="attachmentType"
                  name="attachmentType"
                >
                  {ATTACHMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div
            className={cn(
              "grid gap-4",
              hasGarage === "yes" ? "md:grid-cols-2" : "md:grid-cols-1",
            )}
          >
            {hasGarage === "yes" ? (
              <div className="space-y-2">
                <Label htmlFor="attachmentType">Detached / adjoining</Label>
                <select
                  className={selectClassName}
                  defaultValue={survey.attachment_type || ATTACHMENT_TYPES[0]}
                  id="attachmentType"
                  name="attachmentType"
                >
                  {ATTACHMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="constructionType">Construction</Label>
              <select
                className={selectClassName}
                defaultValue={survey.construction_type || CONSTRUCTION_TYPES[0]}
                id="constructionType"
                name="constructionType"
              >
                {CONSTRUCTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instructingParty">Instructing party</Label>
              <Input
                className="h-11 text-base sm:h-10 sm:text-sm"
                defaultValue={survey.instructing_party || ""}
                id="instructingParty"
                name="instructingParty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engineerName">Engineer name</Label>
              <Input
                className="h-11 text-base sm:h-10 sm:text-sm"
                defaultValue={survey.engineer_name || ""}
                id="engineerName"
                name="engineerName"
              />
            </div>
          </div>

          <Button className="h-11 w-full sm:w-auto" disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Save and continue to areas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
