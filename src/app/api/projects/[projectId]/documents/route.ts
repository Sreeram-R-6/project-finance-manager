import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDocument } from "@/services/documents";
const schema = z.object({
  template: z.string().uuid(),
  recipient: z.string().max(1000),
  prose: z.string().max(5000),
  selected: z.array(z.string().uuid()).max(200),
  requested_minor: z.string().regex(/^\d+$/).default("0"),
  member_id: z.string().uuid().optional(),
});
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  try {
    const { projectId } = await params;
    return NextResponse.json(
      await generateDocument(projectId, schema.parse(await request.json())),
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? "Check the document fields."
            : e instanceof Error
              ? e.message
              : "Unable to generate.",
      },
      { status: 400 },
    );
  }
}
