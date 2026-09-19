import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type RegistrationRecord = {
  id: string;
  full_name: string;
  phone_number: string;
  role: "attendee" | "speaker";
  created_at: string;
};

declare global {
  var __praiseFeastRegistrations: RegistrationRecord[] | undefined;
}

function getInMemoryRegistrations() {
  if (!globalThis.__praiseFeastRegistrations) {
    globalThis.__praiseFeastRegistrations = [];
  }

  return globalThis.__praiseFeastRegistrations;
}

async function getRegistrations(): Promise<RegistrationRecord[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase registration fetch failed, falling back to in-memory records.", error.message);
    } else if (data?.length) {
      return data as RegistrationRecord[];
    }
  }

  return getInMemoryRegistrations();
}

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password") ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "praisefeast2026";

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registrations = await getRegistrations();

  return NextResponse.json({ registrations });
}
