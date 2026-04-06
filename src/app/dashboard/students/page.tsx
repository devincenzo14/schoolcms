"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IUser } from "@/types";
import { FiSearch, FiDownload, FiEye, FiEdit2, FiArrowLeft, FiSave } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function StudentsPage() {
  const [students, setStudents] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<IUser | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    firstName: "", lastName: "", middleName: "", suffix: "",
    age: "", dateOfBirth: "", gender: "", address: "",
    gradeLevel: "", parentGuardianName: "", parentGuardianRelationship: "",
    contactNumber: "", previousSchool: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await apiFetch("/api/students");
      const d = await res.json();
      if (d.success) setStudents(d.data);
    } catch {
      showToast("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.firstName || "").toLowerCase().includes(search.toLowerCase())
  );

  const viewStudent = (s: IUser) => {
    setSelectedStudent(s);
    setEditingProfile(false);
    setProfileForm({
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      middleName: s.middleName || "",
      suffix: s.suffix || "",
      age: s.age ? String(s.age) : "",
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "",
      gender: s.gender || "",
      address: s.address || "",
      gradeLevel: s.gradeLevel || "",
      parentGuardianName: s.parentGuardianName || "",
      parentGuardianRelationship: s.parentGuardianRelationship || "",
      contactNumber: s.contactNumber || "",
      previousSchool: s.previousSchool || "",
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const payload = { ...profileForm, age: profileForm.age ? Number(profileForm.age) : null };
      const res = await apiFetch(`/api/users/${selectedStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Student profile updated!", "success");
        setEditingProfile(false);
        fetchStudents();
        setSelectedStudent(data.data);
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((s) => ({
      "Display Name": s.name,
      Email: s.email,
      "Last Name": s.lastName || "",
      "First Name": s.firstName || "",
      "Middle Name": s.middleName || "",
      Suffix: s.suffix || "",
      Age: s.age || "",
      Gender: s.gender || "",
      "Date of Birth": s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : "",
      "Grade Level": s.gradeLevel || "",
      Address: s.address || "",
      "Contact Number": s.contactNumber || "",
      "Parent/Guardian": s.parentGuardianName || "",
      Relationship: s.parentGuardianRelationship || "",
      "Previous School": s.previousSchool || "",
      "Date Joined": new Date(s.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const infoRow = (label: string, value: string | undefined) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value || <span className="text-gray-300 italic">Not set</span>}</p>
    </div>
  );

  // ====== STUDENT DETAIL VIEW ======
  if (selectedStudent) {
    const s = selectedStudent;
    return (
      <div>
        <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm mb-4 transition-colors">
          <FiArrowLeft size={16} /> Back to Students
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-emerald-600">{s.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{s.name}</h1>
              <p className="text-sm text-gray-500">{s.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            {!editingProfile ? (
              <button onClick={() => setEditingProfile(true)} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                <FiEdit2 size={14} /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingProfile(false)} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
                <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
                  <FiSave size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Student Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Last Name</label><input type="text" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} className={inputClass} /></div>
                  <div><label className={labelClass}>First Name</label><input type="text" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} className={inputClass} /></div>
                  <div><label className={labelClass}>Middle Name</label><input type="text" name="middleName" value={profileForm.middleName} onChange={handleProfileChange} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Suffix</label>
                    <select name="suffix" value={profileForm.suffix} onChange={handleProfileChange} className={inputClass}>
                      <option value="">None</option><option value="Jr.">Jr.</option><option value="Sr.">Sr.</option><option value="II">II</option><option value="III">III</option><option value="IV">IV</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Age</label><input type="number" name="age" value={profileForm.age} onChange={handleProfileChange} min={3} max={25} className={inputClass} /></div>
                  <div><label className={labelClass}>Date of Birth</label><input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select name="gender" value={profileForm.gender} onChange={handleProfileChange} className={inputClass}>
                      <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Grade Level</label><input type="text" name="gradeLevel" value={profileForm.gradeLevel} onChange={handleProfileChange} className={inputClass} /></div>
                </div>
                <div className="mt-4"><label className={labelClass}>Address</label><textarea name="address" value={profileForm.address} onChange={handleProfileChange} rows={2} className={`${inputClass} resize-none`} /></div>
                <div className="mt-4"><label className={labelClass}>Previous School</label><input type="text" name="previousSchool" value={profileForm.previousSchool} onChange={handleProfileChange} className={inputClass} /></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Parent / Guardian</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Name</label><input type="text" name="parentGuardianName" value={profileForm.parentGuardianName} onChange={handleProfileChange} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Relationship</label>
                    <select name="parentGuardianRelationship" value={profileForm.parentGuardianRelationship} onChange={handleProfileChange} className={inputClass}>
                      <option value="">Select</option><option value="Mother">Mother</option><option value="Father">Father</option><option value="Guardian">Guardian</option><option value="Grandparent">Grandparent</option><option value="Sibling">Sibling</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2"><label className={labelClass}>Contact Number</label><input type="tel" name="contactNumber" value={profileForm.contactNumber} onChange={handleProfileChange} className={inputClass} /></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Student Details</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {infoRow("Last Name", s.lastName)}
                  {infoRow("First Name", s.firstName)}
                  {infoRow("Middle Name", s.middleName)}
                  {infoRow("Suffix", s.suffix)}
                  {infoRow("Age", s.age ? String(s.age) : undefined)}
                  {infoRow("Date of Birth", s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : undefined)}
                  {infoRow("Gender", s.gender)}
                  {infoRow("Grade Level", s.gradeLevel)}
                  {infoRow("Previous School", s.previousSchool)}
                </div>
                <div className="mt-3">{infoRow("Address", s.address)}</div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Parent / Guardian</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {infoRow("Name", s.parentGuardianName)}
                  {infoRow("Relationship", s.parentGuardianRelationship)}
                  {infoRow("Contact Number", s.contactNumber)}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">Joined {new Date(s.createdAt).toLocaleDateString()}</p>
      </div>
    );
  }

  // ====== STUDENTS LIST VIEW ======
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
            />
          </div>
          {filtered.length > 0 && (
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors">
              <FiDownload size={16} /><span>Export Excel</span>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">{search ? "No students match your search." : "No student accounts yet."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Grade Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => viewStudent(s)} className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600">{s.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors">{s.name}</span>
                          {s.firstName && <p className="text-xs text-gray-400">{s.lastName}, {s.firstName}</p>}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{s.gradeLevel || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{s.contactNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => viewStudent(s)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                          <FiEye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
