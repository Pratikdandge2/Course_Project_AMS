"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { loadRegistration, clearRegistration } from "../../../lib/authStore";
import { StepperHeader } from "../../../components/StepperHeader";

type StreamsResponse = { streams: string[] };
type CompanyResponse = { items: string[] };

type Course = { degree: string; stream: string; endYear: number; isStillPursuing?: boolean };

const DEGREES = [
  "Bachelor of Engineering - BE",
  "Master of Engineering - ME",
  "Master of Business Administration - MBA",
  "Master of Computer Applications - MCA",
  "Diploma in Engineering",
  "Doctor of Philosophy - PhD"
];

function graduationYears() {
  const start = 2008;
  const end = new Date().getFullYear() + 4;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function splitTags(s: string) {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function BatchPage() {
  const router = useRouter();
  const reg = useMemo(() => (typeof window === "undefined" ? { email: null, regToken: null } : loadRegistration()), []);
  const token = reg.regToken;

  const [streams, setStreams] = useState<string[]>([]);
  const [role, setRole] = useState<"ALUMNI" | "FACULTY" | "STUDENT" | null>(null);

  const [course, setCourse] = useState<Course>({ degree: DEGREES[0]!, stream: "", endYear: graduationYears()[0]! });
  const [courses, setCourses] = useState<Course[]>([]);

  const [company, setCompany] = useState("");
  const [companyItems, setCompanyItems] = useState<string[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);

  const [position, setPosition] = useState("");
  const [workFromYear, setWorkFromYear] = useState<number | "">("");
  const [workToYear, setWorkToYear] = useState<number | "PRESENT" | "">("PRESENT");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [rolesPlayed, setRolesPlayed] = useState("");
  const [industries, setIndustries] = useState("");
  const [skills, setSkills] = useState("");

  const [facultyDepartment, setFacultyDepartment] = useState("");
  const [facultyDesignation, setFacultyDesignation] = useState("");
  const [facultyFromYear, setFacultyFromYear] = useState<number | "">("");
  const [facultyToYear, setFacultyToYear] = useState<number | "PRESENT" | "">("PRESENT");

  const years = graduationYears();

  useEffect(() => {
    if (!token) {
      toast.error("Please complete step 1 first");
      router.push("/user/create");
      return;
    }
    void apiFetch<StreamsResponse>("/api/streams")
      .then((r) => setStreams(r.streams))
      .catch(() => setStreams([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!company.trim()) {
      setCompanyItems([]);
      return;
    }
    setCompanyLoading(true);
    const t = window.setTimeout(() => {
      apiFetch<CompanyResponse>(`/api/companies/search?q=${encodeURIComponent(company)}`)
        .then((r) => setCompanyItems(r.items))
        .catch(() => setCompanyItems([]))
        .finally(() => setCompanyLoading(false));
    }, 250);
    return () => window.clearTimeout(t);
  }, [company]);

  function addCourse() {
    if (!course.stream) {
      toast.error("Please select a stream");
      return;
    }
    setCourses((prev) => [...prev, course]);
  }

  async function submit() {
    if (!token) return;
    if (!role) {
      toast.error("Either Alumni or Faculty Registration is required to proceed.");
      return;
    }

    const t = toast.loading("Submitting for approval...");
    try {
      if (role === "FACULTY") {
        await apiFetch("/api/auth/register/step2/faculty", {
          method: "POST",
          token,
          body: JSON.stringify({
            department: facultyDepartment,
            designation: facultyDesignation,
            fromYear: facultyFromYear === "" ? undefined : facultyFromYear,
            toYear: facultyToYear === "PRESENT" || facultyToYear === "" ? null : facultyToYear
          })
        });
      } else {
        const finalCourses = courses.length ? courses : [];
        if (!finalCourses.length) {
          toast.error("Please add at least one course/program", { id: t });
          return;
        }
        const work = {
          company: company || undefined,
          position: position || undefined,
          workFromYear: workFromYear === "" ? undefined : workFromYear,
          workToYear: workToYear === "PRESENT" || workToYear === "" ? null : workToYear,
          yearsExperience: yearsExperience === "" ? undefined : yearsExperience,
          rolesPlayed: splitTags(rolesPlayed),
          industries: splitTags(industries),
          skills: splitTags(skills)
        };
        await apiFetch(`/api/auth/register/step2/${role === "ALUMNI" ? "alumni" : "student"}`, {
          method: "POST",
          token,
          body: JSON.stringify({ courses: finalCourses, work })
        });
      }

      toast.success("Submitted", { id: t });
      router.push("/user/completed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed", { id: t });
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepperHeader step={2} />

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-semibold">Choose to register as an alumnus/alumna or a faculty member.</div>
          <div className="mt-2 text-slate-600">
            Please add the courses/programs that you pursued, if you are an alumnus/alumna, or add your department and
            designation details if you are a faculty member.
          </div>
          <ul className="mt-3 list-disc pl-5 text-slate-600">
            <li>You can add multiple courses/programs if you studied more than one course.</li>
            <li>If you are a faculty and an alumnus you can register as both, choose either of them to begin with.</li>
            <li className="font-semibold text-slate-700">Either Alumni or Faculty Registration is required to proceed.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={`rounded px-4 py-2 text-sm font-semibold text-white ${role === "ALUMNI" ? "bg-[#17A2B8]" : "bg-[#17A2B8]/90 hover:bg-[#17A2B8]"}`}
            onClick={() => setRole("ALUMNI")}
          >
            Register as Alumni
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-semibold text-white ${role === "FACULTY" ? "bg-[#17A2B8]" : "bg-[#17A2B8]/90 hover:bg-[#17A2B8]"}`}
            onClick={() => setRole("FACULTY")}
          >
            Register as Faculty
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-semibold text-white ${role === "STUDENT" ? "bg-[#FFA500]" : "bg-[#FFA500]/90 hover:bg-[#FFA500]"}`}
            onClick={() => setRole("STUDENT")}
          >
            Register as Student
          </button>
        </div>

        {role === "FACULTY" ? (
          <div className="mt-6 grid gap-4">
            <div className="text-sm font-extrabold text-slate-900">Faculty Details</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600">Department*</div>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={facultyDepartment}
                  onChange={(e) => setFacultyDepartment(e.target.value)}
                >
                  <option value="">Select department</option>
                  {streams.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Designation*</div>
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={facultyDesignation}
                  onChange={(e) => setFacultyDesignation(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600">From Year</div>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={facultyFromYear === "" ? "" : String(facultyFromYear)}
                  onChange={(e) => setFacultyFromYear(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">To Year</div>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={facultyToYear === "" ? "" : String(facultyToYear)}
                  onChange={(e) => setFacultyToYear(e.target.value === "PRESENT" ? "PRESENT" : e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="PRESENT">Present</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : role ? (
          <div className="mt-6 grid gap-4">
            <div className="text-sm font-extrabold text-slate-900">
              {role === "STUDENT"
                ? "Please select the course/program you are still pursuing"
                : "Please select the course/program you pursued"}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Course / Degree*</div>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={course.degree}
                  onChange={(e) => setCourse((c) => ({ ...c, degree: e.target.value }))}
                >
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Stream*</div>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={course.stream}
                  onChange={(e) => setCourse((c) => ({ ...c, stream: e.target.value }))}
                >
                  <option value="">Select stream</option>
                  {streams.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">
                  End Date {role === "STUDENT" ? "(will leave in)" : "(left / will leave in)"}*
                </div>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={String(course.endYear)}
                  onChange={(e) => setCourse((c) => ({ ...c, endYear: Number(e.target.value) }))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={addCourse}
              >
                Confirm Course
              </button>
              <div className="text-xs text-slate-600">
                Graduation year helps us identify your batch. If you didn&apos;t graduate here, enter your batchmates&apos; year.
              </div>
            </div>

            {courses.map((c, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4 text-sm">
                <div className="font-semibold text-slate-900">
                  {c.degree} — {c.stream} <span className="text-slate-600">Year - {c.endYear}</span>
                </div>
                <button
                  type="button"
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setCourses((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Delete
                </button>
              </div>
            ))}

            <div className="text-xs text-slate-600">
              Add a Course you are Still Pursuing | Also Register as Faculty | Add Additional Course
            </div>

            <div className="mt-2">
              <div className="text-sm font-extrabold text-slate-900">Current / Latest Work Details</div>
              <div className="mt-1 text-sm text-slate-600">Please enter your Current Work details &amp; Work Experience details</div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="relative">
                  <div className="text-xs font-semibold text-slate-600">Company / Organization</div>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Start typing the name to get suggestions"
                  />
                  {companyLoading ? <div className="mt-1 text-xs text-slate-500">Searching...</div> : null}
                  {companyItems.length ? (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded border border-slate-200 bg-white text-sm shadow">
                      {companyItems.map((it) => (
                        <button
                          key={it}
                          type="button"
                          className="block w-full px-3 py-2 text-left hover:bg-slate-50"
                          onClick={() => {
                            setCompany(it);
                            setCompanyItems([]);
                          }}
                        >
                          {it}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">Position / Role</div>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600">From Year</div>
                  <select
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={workFromYear === "" ? "" : String(workFromYear)}
                    onChange={(e) => setWorkFromYear(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">Select</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">To Year</div>
                  <select
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={workToYear === "" ? "" : String(workToYear)}
                    onChange={(e) => setWorkToYear(e.target.value === "PRESENT" ? "PRESENT" : e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="PRESENT">Present</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Total years of relevant experience</div>
                  <select
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={yearsExperience === "" ? "" : String(yearsExperience)}
                    onChange={(e) => setYearsExperience(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} Years
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 grid gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600">Role that you played (comma separated)</div>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={rolesPlayed}
                    onChange={(e) => setRolesPlayed(e.target.value)}
                    placeholder="e.g. Developer, Team Lead"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Industries you worked in (comma separated)</div>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={industries}
                    onChange={(e) => setIndustries(e.target.value)}
                    placeholder="e.g. FinTech, EdTech"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Professional Skills (comma separated)</div>
                  <input
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, SQL"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-slate-600 hover:underline"
            onClick={() => {
              clearRegistration();
              router.push("/register");
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void submit()}
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

