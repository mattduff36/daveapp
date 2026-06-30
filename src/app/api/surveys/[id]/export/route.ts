import { NextResponse } from "next/server";
import { buildSurveyReportBuffer } from "@/lib/report/email-report";

interface ExportRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: ExportRouteProps) {
  try {
    const { id } = await params;
    const { buffer, filename } = await buildSurveyReportBuffer(id);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 },
    );
  }
}
