"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/dashboard/ToastProvider";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiSave, FiPhone, FiMapPin, FiCalendar, FiBook } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    gradeLevel: "",
    parentGuardianName: "",
    parentGuardianRelationship: "",
    contactNumber: "",
    previousSchool: "",
  });

  useRefreshData(useCallback(() => {
    apiFetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const u = d.data;
          setForm({
            name: u.name || "",
            email: u.email || "",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            middleName: u.middleName || "",
            suffix: u.suffix || "",
            age: u.age ? String(u.age) : "",
            dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
            gender: u.gender || "",
            address: u.address || "",
            gradeLevel: u.gradeLevel || "",
            parentGuardianName: u.parentGuardianName || "",
            parentGuardianRelationship: u.parentGuardianRelationship || "",
            contactNumber: u.contactNumber || "",
            previousSchool: u.previousSchool || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveInfo = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and email are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
      };
      const res = await apiFetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Profile updated!", "success");
      } else {
        showToast(data.error || "Failed to update", "error");
      }
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast("Enter your current password", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords don't match", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Password changed!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.error || "Failed to change password", "error");
      }
    } catch {
      showToast("Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Account Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Account Information</h2>
        <p className="text-xs text-gray-400 mb-4">Your login credentials</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Display Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Student Information</h2>
        <p className="text-xs text-gray-400 mb-4">Personal details from your enrollment</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Dela Cruz" />
          </div>
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="Juan" />
          </div>
          <div>
            <label className={labelClass}>Middle Name</label>
            <input type="text" name="middleName" value={form.middleName} onChange={handleChange} className={inputClass} placeholder="Santos" />
          </div>
          <div>
            <label className={labelClass}>Suffix</label>
            <select name="suffix" value={form.suffix} onChange={handleChange} className={inputClass}>
              <option value="">None</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} min={3} max={25} className={inputClass} placeholder="16" />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <div className="relative">
              <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Grade Level</label>
            <div className="relative">
              <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="e.g. Grade 7" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Address</label>
          <div className="relative">
            <FiMapPin className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className={`${inputClass} pl-10 resize-none`}
              placeholder="Full home address"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Previous School</label>
          <input type="text" name="previousSchool" value={form.previousSchool} onChange={handleChange} className={inputClass} placeholder="Name of previous school (if any)" />
        </div>
      </div>

      {/* Parent / Guardian Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Parent / Guardian Information</h2>
        <p className="text-xs text-gray-400 mb-4">Contact details for parent or guardian</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Parent / Guardian Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" name="parentGuardianName" value={form.parentGuardianName} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="Full name" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Relationship</label>
            <select name="parentGuardianRelationship" value={form.parentGuardianRelationship} onChange={handleChange} className={inputClass}>
              <option value="">Select Relationship</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Guardian">Guardian</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Contact Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="09XX XXX XXXX" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleSaveInfo}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <FiSave size={15} />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h2>
        <p className="text-xs text-gray-400 mb-4">Update your account password</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-10`}
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-10`}
                placeholder="At least 6 characters"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-10`}
                placeholder="Re-enter new password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <FiLock size={15} />
            {saving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
