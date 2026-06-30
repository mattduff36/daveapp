import type { ReactNode } from "react";
import type { CompanySettings, Survey, SurveyArea, SurveyPhoto } from "@/lib/survey/types";
import {
  buildAreaObservation,
  buildPropertyDescription,
} from "@/lib/survey/report-text";
import { resolvePhotoUrl } from "@/lib/survey/photos";
import { getAreaTypeLabel } from "@/lib/survey/constants";

interface ReportPreviewProps {
  survey: Survey;
  areas: SurveyArea[];
  photos: SurveyPhoto[];
  photoUrls: Record<string, string>;
  company: CompanySettings | null;
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="report-section space-y-3">
      <h2 className="report-heading">{title}</h2>
      {children}
    </section>
  );
}

export function ReportPreview({
  survey,
  areas,
  photos,
  photoUrls,
  company,
}: ReportPreviewProps) {
  const internalAreas = areas.filter((area) => area.area_type === "internal");
  const externalAreas = areas.filter((area) => area.area_type === "external");
  const address = survey.property_address || "Structural Survey Report";
  const reference = survey.reference_number || "Draft";

  return (
    <article className="report-preview font-report space-y-8 rounded-xl border border-border bg-white p-6 text-[15px] leading-7 text-foreground shadow-sm sm:p-10">
      <header className="report-cover space-y-4 border-b border-border pb-8 text-center">
        {company?.company_name ? (
          <div className="space-y-1">
            <p className="text-lg font-semibold">{company.company_name}</p>
            {company.company_address ? (
              <p className="text-sm text-muted-foreground">{company.company_address}</p>
            ) : null}
            {[company.company_phone, company.company_website]
              .filter(Boolean)
              .length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {[company.company_phone, company.company_website]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Structural Visual Survey Report
          </p>
          <h1 className="text-3xl font-semibold">{address}</h1>
          <p>Reference: {reference}</p>
          <p>Engineer: {survey.engineer_name || "Not recorded"}</p>
          <p>Instructing party: {survey.instructing_party || "Not recorded"}</p>
        </div>
      </header>

      <ReportSection title="Contents">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Executive Summary</li>
          <li>Introduction</li>
          <li>Property Description</li>
          <li>Site Observations</li>
          <li>Conclusions</li>
          <li>Recommendations</li>
          <li>Photo Appendix</li>
        </ol>
      </ReportSection>

      <ReportSection title="Executive Summary">
        <p className="whitespace-pre-wrap">
          {survey.executive_summary || "Executive summary not yet generated."}
        </p>
      </ReportSection>

      <ReportSection title="Introduction">
        <p className="whitespace-pre-wrap">
          {survey.introduction || "Introduction not yet generated."}
        </p>
      </ReportSection>

      <ReportSection title="Property Description">
        <p>{buildPropertyDescription(survey)}</p>
      </ReportSection>

      <ReportSection title="Site Observations">
        {internalAreas.length > 0 ? (
          <div className="space-y-4">
            <h3 className="report-subheading">Internal Areas</h3>
            {internalAreas.map((area) => (
              <div key={area.id} className="space-y-2">
                <h4 className="font-semibold">{area.name}</h4>
                <p className="whitespace-pre-wrap">{buildAreaObservation(area)}</p>
              </div>
            ))}
          </div>
        ) : null}

        {externalAreas.length > 0 ? (
          <div className="space-y-4">
            <h3 className="report-subheading">External Elevations</h3>
            {externalAreas.map((area) => (
              <div key={area.id} className="space-y-2">
                <h4 className="font-semibold">{area.name}</h4>
                <p className="whitespace-pre-wrap">{buildAreaObservation(area)}</p>
              </div>
            ))}
          </div>
        ) : null}

        {internalAreas.length === 0 && externalAreas.length === 0 ? (
          <p>No area observations recorded.</p>
        ) : null}
      </ReportSection>

      <ReportSection title="Conclusions">
        <p className="whitespace-pre-wrap">
          {survey.conclusions || "Conclusions not yet generated."}
        </p>
      </ReportSection>

      <ReportSection title="Recommendations">
        <p className="whitespace-pre-wrap">
          {survey.recommendations || "Recommendations not yet generated."}
        </p>
      </ReportSection>

      <ReportSection title="Photo Appendix">
        {photos.length === 0 ? (
          <p>No photographs attached.</p>
        ) : (
          <div className="grid gap-6">
            {photos.map((photo) => {
              const area = areas.find((item) => item.id === photo.area_id);
              const url = resolvePhotoUrl(photo, photoUrls);

              return (
                <figure key={photo.id} className="report-photo space-y-2">
                  <figcaption className="font-semibold">
                    {area ? `${area.name} (${getAreaTypeLabel(area.area_type)})` : "General"}
                  </figcaption>
                  {photo.caption ? (
                    <p className="text-sm text-muted-foreground">{photo.caption}</p>
                  ) : null}
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={photo.caption || area?.name || "Survey photo"}
                      className="max-h-[420px] w-full rounded-lg border border-border object-contain"
                      src={url}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Photo unavailable.</p>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </ReportSection>

      {company?.company_name ? (
        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          {company.company_name}
          {company.company_address ? ` · ${company.company_address}` : ""}
        </footer>
      ) : null}
    </article>
  );
}
