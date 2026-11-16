import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/** Called by the API whenever content changes in the CMS. */
export async function POST(req: NextRequest) {
  if (!process.env.REVALIDATE_SECRET || req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  // Rebuild every page under the root layout (home + all project pages)
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
