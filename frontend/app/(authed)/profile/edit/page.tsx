"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditProfilePage() {
  const router = useRouter();

  useEffect(() => {
    toast("Edit Profile coming soon (demo UI)");
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-2xl font-extrabold text-slate-900">Edit Profile</div>
      <div className="mt-2 text-sm font-semibold text-slate-600">Profile editing UI will be added when backend profile endpoints are implemented.</div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => router.push("/profile")}
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}

