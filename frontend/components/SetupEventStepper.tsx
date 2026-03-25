"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Category = "WEBINAR" | "REUNION" | "HACKATHON" | "CAMPUS_EVENT";

function categoryLabel(c: Category) {
  if (c === "WEBINAR") return "Webinar";
  if (c === "REUNION") return "Reunion";
  if (c === "HACKATHON") return "Hackathon";
  return "Campus Event";
}

export function SetupEventStepper({ presetCategory }: { presetCategory?: Category }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(presetCategory ?? "REUNION");

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return iso;
  });
  const [startTime, setStartTime] = useState<string>("16:00");
  const [addEndTime, setAddEndTime] = useState(false);
  const [endTime, setEndTime] = useState<string>("17:00");

  const [webinarLink, setWebinarLink] = useState("");
  const [visibility, setVisibility] = useState<"REGISTERED">("REGISTERED");
  const [disableRegistrations, setDisableRegistrations] = useState<"NO" | "YES">("NO");
  const [registrationsCloseDate, setRegistrationsCloseDate] = useState<string>(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return iso;
  });

  const [description, setDescription] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [emailInviteOpen, setEmailInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const startDateTime = useMemo(() => {
    const [hh, mm] = startTime.split(":").map(Number);
    const d = new Date(startDate + "T00:00:00");
    d.setHours(hh, mm, 0, 0);
    return d;
  }, [startDate, startTime]);

  const endDateTime = useMemo(() => {
    const [hh, mm] = endTime.split(":").map(Number);
    const d = new Date(startDate + "T00:00:00");
    d.setHours(hh, mm, 0, 0);
    return d;
  }, [endTime, startDate]);

  const canProceedStep1 = title.trim().length > 0 && startDate.trim().length > 0 && startTime.trim().length > 0;

  function resetToFirstStep() {
    setStep(1);
  }

  function onCancel() {
    router.push("/events");
  }

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">Create Event</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Create an event by filling in event details</div>
        </div>
        <button type="button" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onCancel}>
          All Events
        </button>
      </div>

      {/* Stepper */}
      <div className="mt-6">
        <div className="flex items-center gap-6">
          <div className="text-sm font-extrabold text-slate-900">
            [{step === 1 ? "1 ●" : "1 ○"}] <span className="ml-2 font-semibold">Event Details</span>
          </div>
          <div className="text-sm font-extrabold text-slate-900">
            [{step === 2 ? "2 ●" : "2 ○"}] <span className="ml-2 font-semibold">Publish & Share</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {step === 1 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Title*
                  <input
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Alumni Meet 2025"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Category
                  <select
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  >
                    <option value="WEBINAR">Webinars</option>
                    <option value="REUNION">Reunions</option>
                    <option value="HACKATHON">Hackathons</option>
                    <option value="CAMPUS_EVENT">Campus Events</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Start Date*
                  <input
                    type="date"
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <div className="mt-2">
                  <select
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-700">Add End Time</div>
                  <button
                    type="button"
                    className={`text-xs font-semibold ${addEndTime ? "text-[var(--navy)]" : "text-slate-500"} hover:underline`}
                    onClick={() => setAddEndTime((v) => !v)}
                  >
                    {addEndTime ? "Remove" : "Add End Time"}
                  </button>
                </div>
                {addEndTime ? (
                  <div className="mt-2">
                    <select
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    >
                      {["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {category === "WEBINAR" ? (
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Webinar Link
                    <input
                      className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={webinarLink}
                      onChange={(e) => setWebinarLink(e.target.value)}
                      placeholder="https://..."
                    />
                  </label>
                </div>
              ) : null}

              <div>
                <div className="text-xs font-semibold text-slate-700">Visibility*</div>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="radio" checked={visibility === "REGISTERED"} onChange={() => setVisibility("REGISTERED")} />
                    Only registered members
                  </label>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700">Disable Registrations?*</div>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="radio" checked={disableRegistrations === "NO"} onChange={() => setDisableRegistrations("NO")} />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="radio" checked={disableRegistrations === "YES"} onChange={() => setDisableRegistrations("YES")} />
                    Yes
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Registrations Close Date
                  <input
                    type="date"
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={registrationsCloseDate}
                    onChange={(e) => setRegistrationsCloseDate(e.target.value)}
                    disabled={disableRegistrations === "YES"}
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description
                  <textarea
                    className="mt-1 min-h-[120px] w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write the event description..."
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Event Image
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full text-sm"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = URL.createObjectURL(f);
                      setImagePreviewUrl(url);
                    }}
                  />
                </label>
                {imagePreviewUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreviewUrl} alt="Event preview" className="h-48 w-full object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button type="button" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-[#28A745] px-5 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                disabled={!canProceedStep1}
                onClick={() => {
                  if (!canProceedStep1) return toast.error("Please fill required fields");
                  setStep(2);
                }}
              >
                Create Event
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Preview</div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="h-28 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-600" />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">{title || "Untitled event"}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-700">
                        📍 Location (coming soon) - {categoryLabel(category)}
                      </div>
                      <div className="mt-2 text-xs font-semibold text-slate-500">
                        📅 {startDateTime.toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} (IST)
                      </div>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">{categoryLabel(category)}</div>
                  </div>
                  {category === "WEBINAR" && webinarLink.trim() ? (
                    <div className="mt-3 text-xs font-semibold text-slate-600">Webinar link: {webinarLink}</div>
                  ) : null}
                </div>

                <div className="mt-4 text-xs text-slate-600">
                  Description preview:
                  <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">{description || "—"}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-extrabold text-slate-900">Share options</div>
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    className="w-full rounded border-2 border-[#17A2B8] bg-white px-4 py-2 text-sm font-semibold text-[#17A2B8] hover:bg-[#17A2B8]/5"
                    onClick={() => setEmailInviteOpen(true)}
                  >
                    Email invites
                  </button>
                  <button
                    type="button"
                    className="w-full rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                    onClick={() => toast("Posting to dashboard feed (mock)")}
                  >
                    Post to Dashboard Feed
                  </button>
                  <button
                    type="button"
                    className="w-full rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={async () => {
                      const link = `${window.location.origin}/events`;
                      try {
                        await navigator.clipboard.writeText(link);
                        toast.success("Link copied");
                      } catch {
                        toast.error("Copy failed");
                      }
                    }}
                  >
                    Copy link
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={resetToFirstStep}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="rounded bg-[#28A745] px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
                    onClick={() => {
                      toast.success("Event created (mock). Backend APIs will be added next.");
                      router.push("/events");
                    }}
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Note: This flow currently saves nothing server-side. It&apos;s UI scaffolding for the full backend implementation.
            </div>
          </>
        )}
      </div>

      {/* Email invite modal */}
      {emailInviteOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/40 p-4" onClick={() => setEmailInviteOpen(false)} role="dialog" aria-modal>
          <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">Invite by Email</div>
              <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setEmailInviteOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-600">Send an email invite to your friends (mock).</div>
            <input
              className="mt-4 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={inviteEmail}
              placeholder="Email address"
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setEmailInviteOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-[#17A2B8] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => {
                  if (!inviteEmail.trim()) return toast.error("Enter an email");
                  toast.success("Invite sent (mock)");
                  setInviteEmail("");
                  setEmailInviteOpen(false);
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

