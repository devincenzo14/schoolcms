"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/ToastProvider";
import { IUser } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiEye, FiArrowLeft, FiSave } from "react-icons/fi";
import { apiFetch, useRefreshData } from "@/lib/hooks";

export default function UsersManagerPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher" as string,
  });

  const [profileForm, setProfileForm] = useState({
    firstName: "", lastName: "", middleName: "", suffix: "",
    age: "", dateOfBirth: "", gender: "", address: "",
    gradeLevel: "", parentGuardianName: "", parentGuardianRelationship: "",
    contactNumber: "", previousSchool: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await apiFetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useRefreshData(useCallback(() => {
    fetchUsers();
    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCurrentUserId(d.data.userId);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "teacher" });
    setModalOpen(true);
  };

  const openEditModal = (user: IUser) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setModalOpen(true);
  };

  const viewUser = (user: IUser) => {
    setSelectedUser(user);
    setEditingProfile(false);
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      middleName: user.middleName || "",
      suffix: user.suffix || "",
      age: user.age ? String(user.age) : "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      gender: user.gender || "",
      address: user.address || "",
      gradeLevel: user.gradeLevel || "",
      parentGuardianName: user.parentGuardianName || "",
      parentGuardianRelationship: user.parentGuardianRelationship || "",
      contactNumber: user.contactNumber || "",
      previousSchool: user.previousSchool || "",
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      showToast("Name and email are required", "error");
      return;
    }
    if (!editing && !form.password) {
      showToast("Password is required for new users", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/users/${editing._id}` : "/api/users";
      const method = editing ? "PUT" : "POST";

      const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;

      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        showToast(editing ? "User updated!" : "User created!", "success");
        setModalOpen(false);
        fetchUsers();
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save user", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const payload = {
        ...profileForm,
        age: profileForm.age ? Number(profileForm.age) : null,
      };
      const res = await apiFetch(`/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Profile updated!", "success");
        setEditingProfile(false);
        fetchUsers();
        setSelectedUser(data.data);
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("User deleted!", "success");
        setDeleteTarget(null);
        if (selectedUser?._id === deleteTarget._id) setSelectedUser(null);
        fetchUsers();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const data = users.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      "First Name": u.firstName || "",
      "Last Name": u.lastName || "",
      "Middle Name": u.middleName || "",
      Gender: u.gender || "",
      Age: u.age || "",
      "Grade Level": u.gradeLevel || "",
      Address: u.address || "",
      "Contact Number": u.contactNumber || "",
      "Parent/Guardian": u.parentGuardianName || "",
      "Relationship": u.parentGuardianRelationship || "",
      "Previous School": u.previousSchool || "",
      "Date Created": new Date(u.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `Users_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleBadge = (role: string) => {
    const cls = role === "admin" ? "bg-purple-100 text-purple-700"
      : role === "principal" ? "bg-blue-100 text-blue-700"
      : role === "student" ? "bg-emerald-100 text-emerald-700"
      : "bg-green-100 text-green-700";
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${cls}`}>{role}</span>;
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const infoRow = (label: string, value: string | undefined) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value || <span className="text-gray-300 italic">Not set</span>}</p>
    </div>
  );

  // ====== USER DETAIL VIEW ======
  if (selectedUser) {
    const u = selectedUser;
    return (
      <div>
        <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm mb-4 transition-colors">
          <FiArrowLeft size={16} /> Back to Users
        </button>

        {/* User Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-600">{u.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{u.name}</h1>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {roleBadge(u.role)}
              <button onClick={() => openEditModal(u)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit Account">
                <FiEdit2 size={16} />
              </button>
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
                  {infoRow("Last Name", u.lastName)}
                  {infoRow("First Name", u.firstName)}
                  {infoRow("Middle Name", u.middleName)}
                  {infoRow("Suffix", u.suffix)}
                  {infoRow("Age", u.age ? String(u.age) : undefined)}
                  {infoRow("Date of Birth", u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : undefined)}
                  {infoRow("Gender", u.gender)}
                  {infoRow("Grade Level", u.gradeLevel)}
                  {infoRow("Previous School", u.previousSchool)}
                </div>
                <div className="mt-3">{infoRow("Address", u.address)}</div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Parent / Guardian</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {infoRow("Name", u.parentGuardianName)}
                  {infoRow("Relationship", u.parentGuardianRelationship)}
                  {infoRow("Contact Number", u.contactNumber)}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString()}</p>

        {/* Modals */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Account">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Full name" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="user@example.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="Leave blank to keep current" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
                <option value="teacher">Teacher</option><option value="student">Student</option><option value="principal">Principal</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">{saving ? "Saving..." : "Update"}</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ====== USERS LIST VIEW ======
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Manager</h1>
        <div className="flex items-center gap-3">
          {users.length > 0 && (
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
              <FiDownload size={16} /><span className="hidden sm:inline">Export Excel</span>
            </button>
          )}
          <button onClick={openAddModal} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <FiPlus size={18} /><span>Add User</span>
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => viewUser(user)} className="min-w-0 text-left">
                    <p className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </button>
                  {roleBadge(user.role)}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <button onClick={() => viewUser(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details"><FiEye size={16} /></button>
                    <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><FiEdit2 size={16} /></button>
                    {user._id !== currentUserId && (
                      <button onClick={() => setDeleteTarget(user)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 size={16} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Contact</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => viewUser(user)} className="text-left">
                        <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors">{user.name}</p>
                        {user.firstName && <p className="text-xs text-gray-400">{user.lastName}, {user.firstName} {user.middleName || ""}</p>}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-center">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.contactNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => viewUser(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details"><FiEye size={16} /></button>
                        <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><FiEdit2 size={16} /></button>
                        {user._id !== currentUserId && (
                          <button onClick={() => setDeleteTarget(user)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit User" : "Add User"}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Full name" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="user@example.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password {editing ? "(leave blank to keep current)" : "*"}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder={editing ? "Leave blank to keep current" : "Min 6 characters"} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="teacher">Teacher</option><option value="student">Student</option><option value="principal">Principal</option><option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">{saving ? "Saving..." : editing ? "Update" : "Create User"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete User" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} loading={saving} />
    </div>
  );
}
