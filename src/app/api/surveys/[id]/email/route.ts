import { NextResponse } from "next/server";
import { sendSurveyReportEmail } from "@/lib/report/email-report";

interface EmailRouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: EmailRouteProps) {
  try {
    const { id } = await params;
    await sendSurveyReportEmail(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Email failed" },
      { status: 500 },
    );
  }
}
