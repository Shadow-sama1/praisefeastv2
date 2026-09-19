"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isValidNigerianPhoneNumber } from "@/lib/registration-logic";

const speakers = [
  { name: "Deacon Famous", title: "Minister of Praise & Prophetic Worship" },
  { name: "Min MTag", title: "Voice of Revival & Worship Leadership" },
  { name: "Oba Praise", title: "Anointed Praise Leadership" },
  { name: "Min Magdalene", title: "Prayer & Healing Minister" },
  { name: "Dayo Flow", title: "Renowned Praise Leadership" },
  { name: "Min Bright Chukwu", title: "Minister of Songs and Life" },
];

const mediaHighlights = [
  {
    type: "Host",
    name: "Gift Godwin Mordi",
    title: "Host & Convener",
    imageUrl: "/images/host_gift_godwin_mordi.png",
  },
  {
    type: "Event Flyer",
    name: "Praise Feast 2.0",
    title: "Feast & Fellowship",
    imageUrl: "/images/praisefeastflyer.jpg",
  },
  {
    type: "Guest Speaker",
    name: "Deacon Famous",
    title: "One of the many speakers joining us",
    imageUrl: "/images/deaconfamous.png",
  },
];

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  phoneNumber: z
    .string()
    .trim()
    .refine((value) => isValidNigerianPhoneNumber(value), {
      message: "Use a valid Nigerian number, e.g. +234 or 0 prefix.",
    }),
  role: z.enum(["attendee", "speaker"], {
    message: "Please select a role.",
  }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

type StatusState = {
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

function getTimeRemaining(targetDate: Date) {
  const diff = targetDate.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Home() {
  const [status, setStatus] = useState<StatusState | null>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { role: "attendee" },
  });

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeRemaining(new Date("2026-09-19T10:00:00+01:00")));
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const onSubmit = async (data: RegistrationFormValues) => {
    setStatus(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          title: "Registration issue",
          message: result.error || "Something went wrong while registering.",
        });
        return;
      }

      if (result.message === "You're already registered!") {
        setStatus({
          type: "info",
          title: "Already registered",
          message: result.message,
        });
        return;
      }

      setStatus({
        type: "success",
        title: "Registration confirmed",
        message:
          result.message ||
          "You have successfully registered. Welcome to Praise 2.0!",
      });
      reset({ role: "attendee" });
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        title: "Connection error",
        message: "Your registration could not be submitted. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120c1d]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#home" className="text-lg font-semibold tracking-[0.2em] text-[#f0c767] uppercase">
            Praise Feast 2.0
          </a>

          <nav className="hidden items-center gap-6 text-sm text-[#f8f5f2]/80 md:flex">
            <a href="#about" className="transition hover:text-[#f0c767]">About</a>
            <a href="#speakers" className="transition hover:text-[#f0c767]">Speakers</a>
            <a href="#details" className="transition hover:text-[#f0c767]">Details</a>
            <a href="#register" className="transition hover:text-[#f0c767]">Register</a>
            <a href="/admin" className="transition hover:text-[#f0c767]">Admin</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-[#f0c767]/40 bg-[#f0c767]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#f7d98d]">
                Saturday, 19th September 2026
              </p>

              <h1 className="max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
                Praise Feast 2.0
                <span className="mt-2 block text-[#f0c767]">Feast &amp; Fellowship</span>
              </h1>

              <p className="mt-6 max-w-xl text-base text-[#e8d7ef] sm:text-lg">
                A vibrant gathering, hosted by Gift Godwin Mordi, and designed to restore, refresh, and unite believers across generations for a day of blessing, fellowship, and renewed strength.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#register"
                  className="inline-flex items-center justify-center rounded-full bg-[#d4a24d] px-6 py-3 text-sm font-bold text-[#1b1120] shadow-[0_10px_30px_rgba(212,162,77,0.35)] transition hover:-translate-y-0.5 hover:bg-[#f0c767]"
                >
                  Register Now
                </a>
                <a
                  href="#details"
                  className="inline-flex items-center justify-center rounded-full border border-[#f0c767]/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f0c767] hover:bg-white/10"
                >
                  View Venue
                </a>
              </div>

              <div className="mt-10 grid max-w-md grid-cols-4 gap-3 text-left">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-black text-[#f0c767]">{item.value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#d2bfd9]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(212,162,77,0.2),_transparent_35%),linear-gradient(135deg,_rgba(43,28,59,0.9),_rgba(18,12,29,0.96))] p-6 shadow-[0_30px_80px_rgba(13,7,20,0.7)]">
              <div className="mb-5 inline-flex rounded-full border border-[#f0c767]/30 bg-[#f0c767]/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#f7d98d]">
                Event Snapshot
              </div>

              <div className="space-y-4 text-sm text-[#ebdef6]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#d7bfd5]">Host</div>
                  <div className="mt-2 text-xl font-semibold text-white">Gift Godwin Mordi</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#d7bfd5]">Venue</div>
                  <div className="mt-2 text-lg font-medium text-white">Swiss Hotel, VGC, Lekki, Lagos</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#d7bfd5]">Gathering</div>
                  <div className="mt-2 text-lg font-medium text-white">Worship • Fellowship • Revival</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-[2rem] border border-[#f0c767]/20 bg-[#1c1329]/90 p-8 shadow-[0_24px_80px_rgba(16,9,25,0.45)]">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f0c767] via-[#d4a24d] to-[#8a1f5c] text-2xl font-black text-[#1b1120]">
                G
              </div>
              <p className="text-sm uppercase tracking-[0.26em] text-[#d7bfd5]">Welcome</p>
              <h2 className="mt-4 text-3xl font-black text-white">Hosted by Gift Godwin Mordi</h2>
            </div>

            <div className="space-y-6 text-base leading-8 text-[#eadff4]">
              <p>
                Praise Feast 2.0 is a gathering where worship meets community and every heart is invited to encounter the grace of God in a meaningful way. 
              </p>
              <p>
                Gift Godwin Mordi is the founder of Life Bloom City Initiative - a foundation dedicated to assisting children who are at risk of leaving school due to unpaid school fees by providing financial support toward their education.
              </p>
              <p>
                Under the leadership of Gift Godwin Mordi, this experience is designed to refresh and unite believers across generations for a day of fellowship.
              </p>
            </div>
          </div>
        </section>

        <section id="flyer" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 overflow-hidden rounded-[2.25rem] border border-[#f0c767]/20 bg-gradient-to-br from-[#1c1329] via-[#24193a] to-[#120c1d] p-6 shadow-[0_24px_80px_rgba(16,9,25,0.45)] lg:grid-cols-[1fr_1.05fr] lg:items-center lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Save the date</p>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Praise Feast 2.0 event flyer</h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-[#e7d8ef]">
                This is the official flyer for Praise Feast 2.0, highlighting the event's theme, date, and venue. Share it with friends and family to spread the word about this special gathering.
              </p>
              <a
                href="#register"
                className="mt-6 inline-flex rounded-full bg-[#d4a24d] px-5 py-3 text-sm font-bold text-[#1b1120] transition hover:bg-[#f0c767]"
              >
                Register for the event
              </a>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#120c1d]">
              <img
                src="/images/praisefeastflyer.jpg"
                alt="Praise Feast 2.0 flyer placeholder"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="speakers" className="bg-[#190f25]/80 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Featured ministers</p>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Guest Speakers</h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {speakers.map((speaker, index) => (
                <article
                  key={speaker.name}
                  className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#2a1c3a] to-[#1a1225] p-5 transition hover:-translate-y-1 hover:border-[#f0c767]/30"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f0c767] via-[#d4a24d] to-[#8a1f5c] text-xl font-black text-[#1b1120]">
                    {speaker.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="mb-4 h-px w-full bg-gradient-to-r from-[#f0c767]/80 via-white/10 to-transparent" />

                  <div className="text-xl font-bold text-white">{speaker.name}</div>
                  <div className="mt-2 text-sm leading-6 text-[#d5c0db]">{speaker.title}</div>
                  <div className="mt-4 text-xs uppercase tracking-[0.22em] text-[#f3d58a]">
                    Speaker #{index + 1}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="details" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Gathering details</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Event Information</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-white/10 bg-[#1c1329]/80 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-[#d7bfd5]">Date</div>
                <div className="mt-3 text-xl font-bold text-white">Saturday, 19th September 2026</div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[#1c1329]/80 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-[#d7bfd5]">Time</div>
                <div className="mt-3 text-xl font-bold text-white">Doors open from 03:00 PM</div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[#1c1329]/80 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-[#d7bfd5]">Venue</div>
                <div className="mt-3 text-xl font-bold text-white">
                  Swiss Hotel, Plot 4 &amp; 5 Road 8D, Victoria Garden City (VGC), Lekki, Lagos
                </div>
              </div>

              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Praise%20Feast%202.0%20-%20Feast%20%26%20Fellowship&location=Swiss%20Hotel%2C%20Plot%204%20%26%205%20Road%208D%2C%20Victoria%20Garden%20City%20%28VGC%29%2C%20Lekki%2C%20Lagos&dates=20260919T100000Z/20260919T200000Z"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full border border-[#f0c767]/40 bg-[#f0c767]/10 px-5 py-3 text-sm font-semibold text-[#f6d997] transition hover:bg-[#f0c767]/20"
              >
                Add to Calendar
              </a>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1329]/80 shadow-[0_24px_80px_rgba(16,9,25,0.45)]">
              <iframe
                title="Swiss Hotel VGC Map"
                src="https://www.google.com/maps?q=Swiss%20Hotel%20VGC%20Lekki%20Lagos&output=embed"
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Media</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Host, speakers &amp; event visuals</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mediaHighlights.map((item) => (
              <div
                key={item.type}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1329]/80 shadow-[0_24px_80px_rgba(16,9,25,0.45)]"
              >
                <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-[#f0c767]/25 via-[#8a1f5c]/20 to-[#1c1329]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center">
                      <div>
                        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-[#f7d98d]">{item.type}</div>
                        <div className="text-2xl font-black text-white">Add image here</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#d7bfd5]">{item.type}</div>
                  <div className="mt-3 text-xl font-bold text-white">{item.name}</div>
                  <div className="mt-2 text-sm text-[#d5c0db]">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="register" className="bg-[#190f25]/80 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="rounded-[2rem] border border-[#f0c767]/20 bg-[#1c1329]/80 p-7">
              <p className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Register</p>
              <h2 className="mt-2 text-3xl font-black text-white">Reserve your place</h2>
              <p className="mt-4 text-base leading-7 text-[#e7d8ef]">
                Save your spot for a day of worship, fellowship, and worship-filled moments with the Praise Feast community.
              </p>
              <div className="mt-6 rounded-2xl border border-[#f0c767]/20 bg-[#f0c767]/10 p-4 text-sm text-[#f7d98d]">
                <span className="font-semibold">Important:</span> For a smooth check-in, please use your correct mobile number.
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-white/10 bg-[#1e1530] p-6 shadow-[0_24px_80px_rgba(16,9,25,0.45)]">
              <div className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#f8f5f2]">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    {...register("fullName")}
                    className="w-full rounded-2xl border border-white/10 bg-[#130d1d] px-4 py-3 text-white outline-none transition focus:border-[#f0c767]"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-[#ffb2b2]">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-[#f8f5f2]">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    className="w-full rounded-2xl border border-white/10 bg-[#130d1d] px-4 py-3 text-white outline-none transition focus:border-[#f0c767]"
                    placeholder="e.g. +2348012345678"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-[#ffb2b2]">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-medium text-[#f8f5f2]">
                    Registration Type
                  </label>
                  <select
                    id="role"
                    {...register("role")}
                    className="w-full rounded-2xl border border-white/10 bg-[#130d1d] px-4 py-3 text-white outline-none transition focus:border-[#f0c767]"
                  >
                    <option value="attendee">Attendee</option>
                    <option value="speaker">Guest Speaker / Minister</option>
                  </select>
                  {errors.role && (
                    <p className="mt-2 text-sm text-[#ffb2b2]">{errors.role.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#d4a24d] px-5 py-3 text-sm font-bold text-[#1b1120] transition hover:bg-[#f0c767] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Registering..." : "Complete Registration"}
                </button>
              </div>

              {status && (
                <div
                  aria-live="polite"
                  className={`mt-6 rounded-2xl border p-4 ${
                    status.type === "success"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : status.type === "info"
                        ? "border-sky-500/50 bg-sky-500/10 text-sky-300"
                        : "border-red-500/50 bg-red-500/10 text-red-200"
                  }`}
                >
                  <div className="font-semibold">{status.title}</div>
                  <div className="mt-1 text-sm">{status.message}</div>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#120c1d]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center text-sm text-[#d9c3e4] sm:px-6 lg:flex-row lg:text-left lg:px-8">
          <p>
            Built with grace by <a href="https://wa.link/xyvhma" target="_blank" rel="noopener noreferrer" className="font-medium text-[#f0c767] underline-offset-4 transition hover:underline">Enteegee Technologies</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
