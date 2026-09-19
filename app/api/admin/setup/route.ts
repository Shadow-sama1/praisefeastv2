import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const password =
      typeof body?.password === "string"
        ? body.password
        : request.nextUrl.searchParams.get("password") ?? "";
    const expectedPassword = process.env.ADMIN_PASSWORD ?? "praisefeast2026";

    if (password !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase credentials. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.rpc("ensure_registrations_table");

    if (error) {
      return NextResponse.json(
        {
          error: `Supabase setup failed: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase registrations table is ready.",
    });
  } catch (error) {
    console.error("Admin setup failed:", error);
    return NextResponse.json(
      { error: "Unexpected error while setting up the database." },
      { status: 500 },
    );
  }
}
