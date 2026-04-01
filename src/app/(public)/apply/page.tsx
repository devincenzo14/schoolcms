"use client";

import { useState } from "react";
import Image from "next/image";

const initialForm = {
  lastName: "",
  firstName: "",
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
  email: "",
  previousSchool: "",
};

export default function ApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        age: Number(form.age),
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm(initialForm);
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Application Submitted!
            </h1>
            <p className="text-green-600 text-sm">
              Thank you for your interest in Edulinks Learning Center. We will
              review your application and get back to you soon.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Image
            src="/logo.png"
            alt="Edulinks Learning Center"
            width={56}
            height={56}
            className="mx-auto mb-4 rounded-xl"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Enrollment Application
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Fill out the form below to apply for enrollment at Edulinks Learning
            Center. Fields marked with <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8"
        >
          {/* Section: Student Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Student Information</h2>
            <p className="text-xs text-gray-400 mb-4">Personal details of the student</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Dela Cruz"
                />
              </div>
              <div>
                <label className={labelClass}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Santos (optional)"
                />
              </div>
              <div>
                <label className={labelClass}>Suffix</label>
                <select
                  name="suffix"
                  value={form.suffix}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  required
                  min={3}
                  max={25}
                  className={inputClass}
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <label className={labelClass}>
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Grade Level Applying For <span className="text-red-500">*</span>
                </label>
                <select
                  name="gradeLevel"
                  value={form.gradeLevel}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select grade level</option>
                  <option value="Kinder">Kinder</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className={labelClass}>
                Complete Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={2}
                className={inputClass + " resize-none"}
                placeholder="House/Block/Lot No., Street, Barangay, City/Municipality, Province"
              />
            </div>
            <div className="mt-4">
              <label className={labelClass}>Previous School</label>
              <input
                type="text"
                name="previousSchool"
                value={form.previousSchool}
                onChange={handleChange}
                className={inputClass}
                placeholder="Name of previous school (optional)"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Section: Parent/Guardian Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Parent / Guardian Information</h2>
            <p className="text-xs text-gray-400 mb-4">Who should we contact regarding this application?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Parent/Guardian Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="parentGuardianName"
                  value={form.parentGuardianName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelClass}>
                  Relationship to Student <span className="text-red-500">*</span>
                </label>
                <select
                  name="parentGuardianRelationship"
                  value={form.parentGuardianRelationship}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="09XX XXX XXXX"
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="parent@email.com (optional)"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 text-sm"
          >
            {loading ? "Submitting Application..." : "Submit Enrollment Application"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          By submitting this form, you agree to the processing of the provided information
          for enrollment purposes.
        </p>
      </div>
    </div>
  );
}
