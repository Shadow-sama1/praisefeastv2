import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  formatWhatsAppNumber,
  isValidNigerianPhoneNumber,
  normalizeNigerianPhoneNumber,
} from "@/lib/registration-logic";

const registrationSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required."),
  phone_number: z
    .string()
    .trim()
    .refine((value) => isValidNigerianPhoneNumber(value), {
      message: "Use a valid Nigerian phone number.",
    }),
  role: z.enum(["attendee", "speaker"]),
});

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

const inMemoryStore = () => {
  if (!globalThis.__praiseFeastRegistrations) {
    globalThis.__praiseFeastRegistrations = [];
  }

  return globalThis.__praiseFeastRegistrations;
};

async function sendWhatsAppConfirmation(phoneNumber: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_MESSAGE_TEMPLATE ?? "registration_confirmation";

  if (!token || !phoneNumberId) {
    console.warn("WhatsApp credentials missing. Registration is still saved locally.");
    return { sent: false, reason: "missing_credentials" };
  }

  const fullNumber = formatWhatsAppNumber(phoneNumber);
  const payload = {
    messaging_product: "whatsapp",
    to: fullNumber,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en_US",
      },
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("WhatsApp template send failed. Falling back to direct message.", errorText);

      const fallbackResponse = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: fullNumber,
            type: "text",
            text: {
              body: "You have successfully registered. Welcome to Praise 2.0!",
            },
          }),
        },
      );

      return {
        sent: fallbackResponse.ok,
        reason: fallbackResponse.ok ? "fallback_text" : "send_failed",
      };
    }

    return { sent: true, reason: "template_message" };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return { sent: false, reason: "request_exception" };
  }
}

async function registrationExists(phoneNumber: string) {
  const normalized = normalizeNigerianPhoneNumber(phoneNumber);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("registrations")
      .select("id, phone_number")
      .ilike("phone_number", normalized)
      .limit(1);

    if (error) {
      console.warn("Supabase duplicate check failed, continuing with fallback:", error.message);
      return false;
    }

    return !!data?.length;
  }

  const existing = inMemoryStore().find(
    (entry) => entry.phone_number === normalized || entry.phone_number === phoneNumber,
  );

  return !!existing;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid registration details.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const normalizedPhone = normalizeNigerianPhoneNumber(parsed.data.phone_number);

    if (!isValidNigerianPhoneNumber(normalizedPhone)) {
      return NextResponse.json({ error: "Use a valid Nigerian phone number." }, { status: 400 });
    }

    const alreadyExists = await registrationExists(normalizedPhone);

    if (alreadyExists) {
      return NextResponse.json(
        { message: "You're already registered!" },
        { status: 200 },
      );
    }

    const newRecord: RegistrationRecord = {
      id: crypto.randomUUID(),
      full_name: parsed.data.full_name.trim(),
      phone_number: normalizedPhone,
      role: parsed.data.role,
      created_at: new Date().toISOString(),
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("registrations").insert([
        {
          id: newRecord.id,
          full_name: newRecord.full_name,
          phone_number: newRecord.phone_number,
          role: newRecord.role,
          created_at: newRecord.created_at,
        },
      ]);

      if (error) {
        console.warn("Supabase insert failed; using in-memory fallback for this request.", error.message);
        inMemoryStore().push(newRecord);
      }
    } else {
      inMemoryStore().push(newRecord);
    }

    const whatsappResult = await sendWhatsAppConfirmation(normalizedPhone);

    return NextResponse.json({
      message: "You have successfully registered. Welcome to Praise 2.0!",
      registration: newRecord,
      whatsappSent: whatsappResult.sent,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving your registration." },
      { status: 500 },
    );
  }
}
