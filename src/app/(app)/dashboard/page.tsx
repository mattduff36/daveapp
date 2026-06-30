import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSurveyFormAction,
  deleteSurveyFormAction,
  getSurveysList,
} from "@/lib/actions/survey-actions";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const surveys = await getSurveysList();

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle="Manage saved structural visual surveys"
        title="Survey Dashboard"
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Saved surveys</h2>
            <p className="text-muted-foreground">
              Resume in-progress inspections or start a new domestic property survey.
            </p>
          </div>
          <form action={createSurveyFormAction}>
            <Button size="lg" type="submit">
              <Plus className="h-4 w-4" />
              New survey
            </Button>
          </form>
        </div>

        {surveys.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No surveys yet</CardTitle>
              <CardDescription>
                Create your first survey to capture property details, room observations, and photos.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {surveys.map((survey) => (
              <Card key={survey.id} className="transition hover:border-primary/30 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">
                        {survey.property_address || "Untitled property"}
                      </CardTitle>
                      <CardDescription className="font-data mt-2">
                        Ref {survey.reference_number || "Draft"} · Updated {formatDate(survey.updated_at)}
                      </CardDescription>
                    </div>
                    <Badge>{survey.area_count} areas</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <Button asChild>
                    <Link href={`/surveys/${survey.id}`}>Open survey</Link>
                  </Button>
                  <form action={deleteSurveyFormAction}>
                    <input name="surveyId" type="hidden" value={survey.id} />
                    <Button type="submit" variant="outline">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
