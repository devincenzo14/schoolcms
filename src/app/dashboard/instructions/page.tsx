"use client";

import { useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiHome,
  FiImage,
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiClipboard,
  FiLayers,
  FiInfo,
  FiStar,
  FiHelpCircle,
  FiBriefcase,
} from "react-icons/fi";

interface Section {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function CollapsibleSection({ title, icon, content }: Section & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600">{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {open ? <FiChevronDown size={18} className="text-gray-400" /> : <FiChevronRight size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{content}</div>}
    </div>
  );
}

export default function InstructionsPage() {
  const sections: Section[] = [
    {
      title: "Dashboard Overview",
      icon: <FiHome size={18} />,
      content: (
        <div className="space-y-2">
          <p>The <strong>Dashboard</strong> is your home page after logging in. It displays stat cards showing the number of items in each section (carousel slides, programs, events, announcements, applications, and users).</p>
          <p>Quick action buttons let you navigate directly to the most commonly used pages.</p>
          <p><strong>Note:</strong> The stats shown depend on your role. Teachers see classes, grades, and students. Admins and principals see everything.</p>
        </div>
      ),
    },
    {
      title: "Carousel Manager",
      icon: <FiImage size={18} />,
      content: (
        <div className="space-y-2">
          <p>Manage the hero carousel slides that appear on the homepage.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Add Slide</strong> to create a new carousel item with a title, subtitle, image, button text, and link.</li>
            <li>Use the <strong>drag handles</strong> or reorder buttons to change the slide order.</li>
            <li>Toggle slides on/off with the <strong>active/inactive</strong> switch.</li>
            <li>Click the edit icon to modify an existing slide, or the trash icon to delete.</li>
          </ul>
          <p><em>Available to: Admin, Principal</em></p>
        </div>
      ),
    },
    {
      title: "Programs Manager",
      icon: <FiBookOpen size={18} />,
      content: (
        <div className="space-y-2">
          <p>Manage the educational programs displayed on the website.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Add Program</strong> to create a new program with a title, description, and image.</li>
            <li>Programs are displayed in order on the public website.</li>
            <li>Edit or delete programs using the action buttons.</li>
          </ul>
          <p><em>Available to: Admin, Principal, Teacher</em></p>
        </div>
      ),
    },
    {
      title: "Events Manager",
      icon: <FiCalendar size={18} />,
      content: (
        <div className="space-y-2">
          <p>Upload and organize event photos by category.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Upload Images</strong> to add new event photos. You can select multiple images at once.</li>
            <li>Each image must be assigned a <strong>category</strong> (Nursery, Kinder, or Preschool).</li>
            <li>Use the category filter dropdown to view images from a specific category.</li>
            <li>Optionally add a caption that will appear on all uploaded images.</li>
          </ul>
          <p><em>Available to: Admin, Principal, Teacher</em></p>
        </div>
      ),
    },
    {
      title: "Announcements Manager",
      icon: <FiMessageSquare size={18} />,
      content: (
        <div className="space-y-2">
          <p>Create and manage announcements for the school website.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Create</strong> to write a new announcement with a title, content (rich text), images, and category.</li>
            <li>Announcements can be saved as <strong>drafts</strong> or <strong>published</strong> immediately.</li>
            <li>Use <strong>scheduling</strong> to publish an announcement at a future date/time.</li>
            <li>Set an <strong>expiry date</strong> to automatically hide announcements after a certain date.</li>
          </ul>
          <p><em>Available to: Admin, Principal, Teacher</em></p>
        </div>
      ),
    },
    {
      title: "About Section",
      icon: <FiInfo size={18} />,
      content: (
        <div className="space-y-2">
          <p>Manage the About page content displayed on the public website.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Add <strong>founders</strong> and <strong>teachers</strong> with their name, role, bio, and photo.</li>
            <li>Rearrange the order of team members using the order field.</li>
          </ul>
          <p><em>Available to: Admin only</em></p>
        </div>
      ),
    },
    {
      title: "Testimonials",
      icon: <FiStar size={18} />,
      content: (
        <div className="space-y-2">
          <p>Manage testimonials shown on the homepage.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Add testimonials with a name, role, content, photo, and star rating.</li>
            <li>Toggle the <strong>published</strong> status to show/hide testimonials on the website.</li>
          </ul>
          <p><em>Available to: Admin only</em></p>
        </div>
      ),
    },
    {
      title: "Applications",
      icon: <FiFileText size={18} />,
      content: (
        <div className="space-y-2">
          <p>View and manage student enrollment applications submitted through the website.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Applications appear with a <strong>Pending</strong> status when first submitted.</li>
            <li>Click on an application to view full details.</li>
            <li>Approve or reject applications using the action buttons.</li>
            <li>Use the <strong>Export</strong> button to download applications as an Excel file.</li>
          </ul>
          <p><em>Available to: Admin, Principal</em></p>
        </div>
      ),
    },
    {
      title: "Classes Manager",
      icon: <FiLayers size={18} />,
      content: (
        <div className="space-y-2">
          <p>Create and manage classes, assign teachers and students.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Add Class</strong> to create a new class with a name, section, subject, teacher, schedule, and students.</li>
            <li>Each class is linked to a teacher and can have multiple students enrolled.</li>
            <li>Teachers only see classes assigned to them.</li>
          </ul>
          <p><em>Available to: Admin, Principal, Teacher</em></p>
        </div>
      ),
    },
    {
      title: "Grades Manager",
      icon: <FiClipboard size={18} />,
      content: (
        <div className="space-y-2">
          <p>Record and manage student grades.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Add Grade</strong> to assign a grade to a student with a subject, score (0-100), term, and optional remarks.</li>
            <li>Filter grades by term using the dropdown.</li>
            <li>Teachers can only edit/delete their own grades.</li>
            <li>When a teacher updates a grade, it will be submitted for <strong>approval</strong> by a principal or admin before the change takes effect.</li>
            <li>Admins and principals can approve or reject grade change requests from the grades page.</li>
          </ul>
          <p><em>Available to: Admin, Principal, Teacher</em></p>
        </div>
      ),
    },
    {
      title: "Teachers Overview",
      icon: <FiBriefcase size={18} />,
      content: (
        <div className="space-y-2">
          <p>View an overview of all teachers and their workload.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>See summary cards showing the <strong>total number of teachers</strong>, <strong>total subjects</strong> being taught, and <strong>total students handled</strong> across all teachers.</li>
            <li>The table lists each teacher with their assigned <strong>subjects</strong>, <strong>number of subjects</strong>, and <strong>number of students</strong> they handle.</li>
            <li>Use the <strong>search bar</strong> to filter teachers by name, email, or subject.</li>
            <li>Click the <strong>View</strong> button to see a teacher&apos;s detailed profile with their full subject list and stats.</li>
          </ul>
          <p><em>Available to: Admin, Principal</em></p>
        </div>
      ),
    },
    {
      title: "Students Manager",
      icon: <FiUsers size={18} />,
      content: (
        <div className="space-y-2">
          <p>View the list of student accounts.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Search for students by name or email.</li>
            <li>View student details and their enrolled classes.</li>
          </ul>
          <p><em>Available to: Admin, Principal, Teacher</em></p>
        </div>
      ),
    },
    {
      title: "User Management",
      icon: <FiUsers size={18} />,
      content: (
        <div className="space-y-2">
          <p>Manage all system users (admin-only).</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click <strong>Add User</strong> to create a new user account with a name, email, password, and role.</li>
            <li>Available roles: Admin, Principal, Teacher, Student.</li>
            <li>Edit a user&apos;s details or delete their account using the action buttons.</li>
          </ul>
          <p><em>Available to: Admin only</em></p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-100 rounded-xl">
          <FiHelpCircle size={22} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Page</h1>
          <p className="text-sm text-gray-500">Learn how to use each section of the CMS dashboard.</p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((s) => (
          <CollapsibleSection key={s.title} {...s} />
        ))}
      </div>
    </div>
  );
}
