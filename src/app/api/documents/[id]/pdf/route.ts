import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { supabaseServer } from "@/lib/supabase/server";
import { printHtml } from "@/lib/documents";
export const runtime = "nodejs";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const c = await supabaseServer();
  const { data: d } = await c
    .from("generated_documents")
    .select("rendered_html,reference_number")
    .eq("id", id)
    .single();
  if (!d)
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route("**/*", (route) => route.abort());
    await page.setContent(printHtml(d.rendered_html));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" },
    });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${d.reference_number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
