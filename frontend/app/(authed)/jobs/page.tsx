"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  jobArea: string;
  skills: string[];
  experience: string;
  salary: string;
  source: "NETWORK" | "PARTNER";
};

const ALL_JOB_AREAS = [
  "Manufacturing & Industrial Enviro...",
  "HR Operations",
  "Engineering & Technology",
  "Information Technology / Software",
  "Enterprise Architecture"
] as const;

const ALL_SKILLS = [
  "Employee Relations",
  "HR compliance",
  "Statutory Compliance",
  "Health & Safety management",
  "Workforce Management"
] as const;

const ALL_COMPANIES = ["VCET", "TCS", "Infosys", "Wipro", "Accenture", "Google", "Microsoft"] as const;

const ALL_LOCATIONS = ["Mumbai", "Hyderabad", "Vasai", "Pune", "Bengaluru"] as const;

const JOBS_SEED: Job[] = [
  {
    id: 1,
    title: "Asst. HR Manager – Plant HR Operations",
    company: "Vivalicious International Foods",
    location: "Hyderabad (In Office Only)",
    jobArea: "HR Operations",
    skills: ["Employee Relations", "HR compliance", "Workforce Management"],
    experience: "5 - 10 Years",
    salary: "INR 7 LPA - INR 10 LPA",
    source: "NETWORK"
  },
  {
    id: 2,
    title: "Assistant Manager - Business Development",
    company: "Receivables Exchange of India Limited",
    location: "Mumbai",
    jobArea: "Engineering & Technology",
    skills: ["Workforce Management", "Health & Safety management"],
    experience: "6 - 9 Years",
    salary: "INR 8 LPA - INR 12 LPA",
    source: "PARTNER"
  },
  {
    id: 3,
    title: "Enterprise Architect - Solutions",
    company: "Accenture",
    location: "Pune",
    jobArea: "Enterprise Architecture",
    skills: ["Statutory Compliance", "Health & Safety management"],
    experience: "8 - 14 Years",
    salary: "INR 12 LPA - INR 20 LPA",
    source: "PARTNER"
  },
  {
    id: 4,
    title: "Software Engineer - Platform",
    company: "Infosys",
    location: "Bengaluru",
    jobArea: "Information Technology / Software",
    skills: ["Employee Relations", "Workforce Management"],
    experience: "3 - 6 Years",
    salary: "INR 6 LPA - INR 9 LPA",
    source: "NETWORK"
  }
];

export default function JobsPage() {
  const [activeLeftTab, setActiveLeftTab] = useState<"Jobs">("Jobs");

  const [query, setQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(20);

  const [openAcc, setOpenAcc] = useState<{ areas: boolean; skills: boolean; companies: boolean; location: boolean }>({
    areas: true,
    skills: true,
    companies: false,
    location: false
  });

  const [postModal, setPostModal] = useState<null | "JOB" | "INTERNSHIP">(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const expOk = (j: Job) => {
      const m = j.experience.match(/(\d+)\s*-\s*(\d+)/);
      if (!m) return true;
      const min = Number(m[1] ?? 0);
      const max = Number(m[2] ?? 999);
      return max >= expMin && min <= expMax;
    };

    return JOBS_SEED.filter((j) => {
      if (selectedAreas.length && !selectedAreas.includes(j.jobArea)) return false;
      if (selectedSkills.length && !selectedSkills.some((s) => j.skills.includes(s))) return false;
      if (selectedCompanies.length && !selectedCompanies.includes(j.company)) return false;
      if (selectedLocations.length) {
        const ok = selectedLocations.some((l) => j.location.toLowerCase().includes(l.toLowerCase()));
        if (!ok) return false;
      }
      if (!expOk(j)) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.jobArea.toLowerCase().includes(q)
      );
    });
  }, [expMax, expMin, query, selectedAreas, selectedCompanies, selectedLocations, selectedSkills]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">Job Board</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Find &amp; Share career opportunities</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded bg-[#28A745] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => setPostModal("JOB")}
          >
            + Post Job
          </button>
          <button
            type="button"
            className="rounded bg-[#17A2B8] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => setPostModal("INTERNSHIP")}
          >
            + Post Internship
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">Jobs</div>
            <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              {["Posted In Your Network", "Sourced From Partner Network", "Internships"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`w-full rounded px-2 py-2 text-left hover:bg-slate-50 ${t === "Jobs" ? "bg-slate-50" : ""}`}
                  onClick={() => {
                    toast("Filters coming soon");
                    setActiveLeftTab("Jobs");
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <Accordion
                title="Job Areas"
                open={openAcc.areas}
                onToggle={() => setOpenAcc((s) => ({ ...s, areas: !s.areas }))}
              >
                {ALL_JOB_AREAS.map((a) => (
                  <Check
                    key={a}
                    label={a}
                    checked={selectedAreas.includes(a)}
                    onChange={(v) =>
                      setSelectedAreas((prev) => (v ? [...prev, a] : prev.filter((x) => x !== a)))
                    }
                  />
                ))}
              </Accordion>

              <Accordion
                title="Skills"
                open={openAcc.skills}
                onToggle={() => setOpenAcc((s) => ({ ...s, skills: !s.skills }))}
              >
                {ALL_SKILLS.map((s) => (
                  <Check
                    key={s}
                    label={s}
                    checked={selectedSkills.includes(s)}
                    onChange={(v) =>
                      setSelectedSkills((prev) => (v ? [...prev, s] : prev.filter((x) => x !== s)))
                    }
                  />
                ))}
              </Accordion>

              <Accordion
                title="Companies"
                open={openAcc.companies}
                onToggle={() => setOpenAcc((s) => ({ ...s, companies: !s.companies }))}
              >
                {ALL_COMPANIES.map((c) => (
                  <Check
                    key={c}
                    label={c}
                    checked={selectedCompanies.includes(c)}
                    onChange={(v) =>
                      setSelectedCompanies((prev) => (v ? [...prev, c] : prev.filter((x) => x !== c)))
                    }
                  />
                ))}
              </Accordion>

              <Accordion
                title="Location"
                open={openAcc.location}
                onToggle={() => setOpenAcc((s) => ({ ...s, location: !s.location }))}
              >
                {ALL_LOCATIONS.map((l) => (
                  <Check
                    key={l}
                    label={l}
                    checked={selectedLocations.includes(l)}
                    onChange={(v) =>
                      setSelectedLocations((prev) => (v ? [...prev, l] : prev.filter((x) => x !== l)))
                    }
                  />
                ))}
              </Accordion>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-extrabold text-slate-900">Experience</div>
                <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <label className="flex-1">
                    Min
                    <input
                      className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 outline-none focus:border-slate-400"
                      type="number"
                      value={expMin}
                      min={0}
                      max={30}
                      onChange={(e) => setExpMin(Number(e.target.value ?? 0))}
                    />
                  </label>
                  <label className="flex-1">
                    Max
                    <input
                      className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 outline-none focus:border-slate-400"
                      type="number"
                      value={expMax}
                      min={0}
                      max={40}
                      onChange={(e) => setExpMax(Number(e.target.value ?? 20))}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="flex-1 min-w-[220px] rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="🔍 Type a Job Area, Location or a Job Title to filter the jobs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => toast("Filters applied")}
              >
                Search
              </button>
            </div>

            <div className="mt-2 text-xs font-semibold text-slate-600">{results.length} record(s) found</div>

            <div className="mt-4 space-y-4">
              {results.map((j) => (
                <div key={j.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm card-hover">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{j.title}</div>
                      <div className="mt-2 text-xs text-slate-700">
                        <div>
                          <span className="font-semibold text-slate-900">COMPANY: </span>
                          {j.company}
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-slate-900">LOCATION: </span>
                          {j.location}
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-slate-900">JOB AREA: </span>
                          {j.jobArea}
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-slate-900">EXPERIENCE: </span>
                          {j.experience}
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-slate-900">SALARY: </span>
                          {j.salary}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                      onClick={() => toast("View job details coming soon")}
                    >
                      View & Apply
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-700">
                      <span className="font-semibold text-slate-900">SKILLS: </span>
                      {j.skills.join(", ")}
                    </div>
                    <div className="text-right text-[11px] italic text-slate-400">
                      {j.source === "PARTNER" ? "SOURCED FROM PARTNER NETWORK" : "POSTED IN YOUR NETWORK"}
                    </div>
                  </div>
                </div>
              ))}

              {!results.length ? (
                <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-700">
                  No jobs found for your filters.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* Job Post Modal (mock) */}
      {postModal ? (
        <div className="fixed inset-0 z-[80] bg-black/40 p-4" onClick={() => setPostModal(null)} role="dialog" aria-modal>
          <div className="mx-auto mt-16 max-w-3xl rounded-2xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">
                Post {postModal === "JOB" ? "Job" : "Internship"} (coming soon)
              </div>
              <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setPostModal(null)}>
                Close
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-600">
              This project currently supports frontend scaffolding. Backend job creation APIs will be added next.
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              onClick={() => {
                setPostModal(null);
                toast.success("Post flow (mock) closed");
              }}
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={onToggle}>
        <div className="text-xs font-extrabold text-slate-900">{title}</div>
        <div className="text-xs font-extrabold text-slate-500">{open ? "▾" : "▸"}</div>
      </button>
      {open ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

