import { NextResponse } from "next/server";
import { mutate } from "@/services/finance";
import { z } from "zod";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const { projectId } = await params;
    z.string().uuid().parse(projectId);
    const input = z
      .object({ action: z.string(), data: z.record(z.unknown()) })
      .parse(await request.json());
    const id = await mutate(projectId, input.action, input.data);
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? "Check the required fields and amounts."
            : error instanceof Error
              ? error.message
              : "Unable to save.",
      },
      { status: 400 },
    );
  }
}
