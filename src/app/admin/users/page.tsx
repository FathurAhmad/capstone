"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/app/context/authContext";
import Pagination from "@/components/Pagination";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  updated_at: string;
}

export default function ManageUsersPage() {
  const { user: activeUser } = useAuth();
  
  const { data: usersData, isLoading: loading, mutate } = useSWR("/api/users", fetcher);
  const users: User[] = usersData || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Ubah Role State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editRoleUserId, setEditRoleUserId] = useState<string | null>(null);
  const [editRoleUserName, setEditRoleUserName] = useState("");
  const [editRoleValue, setEditRoleValue] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);

  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
  const [confirmResetName, setConfirmResetName] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Password State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [resetUserName, setResetUserName] = useState("");

  // Form State
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: userFullName,
          email: userEmail,
          role: userRole,
        }),
      });
      if (res.ok) {
        toast.success("User successfully added!");
        setUserFullName("");
        setUserEmail("");
        setUserRole("");
        setIsModalOpen(false);
        mutate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add user");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setUserLoading(false);
    }
  };

  const handleResetPassword = (id: string, name: string) => {
    setConfirmResetId(id);
    setConfirmResetName(name);
  };

  const performResetPassword = async () => {
    if (!confirmResetId) return;
    setIsResetting(true);
    try {
      const newPassword = crypto.randomUUID().split("-")[0].substring(0, 8);

      const res = await fetch(`/api/users/${confirmResetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        setGeneratedPassword(newPassword);
        setResetUserName(confirmResetName);
        setResetModalOpen(true);
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal mereset password");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server saat reset password");
    } finally {
      setIsResetting(false);
      setConfirmResetId(null);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success("Password disalin ke clipboard!");
  };

  const handleDeleteUser = (id: string, name: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const performDeleteUser = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${confirmDeleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User berhasil dihapus!");
        mutate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus user");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleEditRole = (u: User) => {
    setEditRoleUserId(u.id);
    setEditRoleUserName(u.full_name);
    setEditRoleValue(u.role);
    setRoleModalOpen(true);
  };

  const performEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleUserId) return;
    setRoleSaving(true);
    try {
      const res = await fetch(`/api/users/${editRoleUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRoleValue }),
      });
      if (res.ok) {
        toast.success("Role berhasil diperbarui!");
        setRoleModalOpen(false);
        mutate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui role");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setRoleSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a3a7c] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#122859] transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New User
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-sm text-gray-600 mb-4">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Last Updated</th>
                    <th className="px-6 py-4 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {u.full_name}
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : u.role === "manager"
                                ? "bg-purple-100 text-purple-700"
                                : u.role === "staff"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(u.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {activeUser?.id !== u.id ? (
                            <>
                              <button
                                onClick={() => handleEditRole(u)}
                                className="text-orange-400 hover:text-orange-600 transition-colors p-1"
                                title="Ubah Role"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleResetPassword(u.id, u.full_name)}
                                className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                                title="Reset Password"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.286l7.669-7.669A6 6 0 1115 7zm-3 2h.01v.01H12V9z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.full_name)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                title="Delete user"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">You</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length > 0 && (
                <div className="px-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(users.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Create New User
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      required
                    >
                      <option value="" disabled>
                        -- Select Role --
                      </option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={userLoading}
                      className="flex-1 bg-[#1a3a7c] text-white font-medium py-2.5 rounded-lg hover:bg-[#122859] transition-colors disabled:opacity-50"
                    >
                      {userLoading ? "Saving..." : "Add User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Password Reset Berhasil
                </h2>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Password baru untuk <strong className="text-gray-900 font-semibold">{resetUserName}</strong> adalah:
                </p>
                <div className="flex items-center justify-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="text-2xl font-mono text-gray-900 tracking-wider font-semibold">
                    {generatedPassword}
                  </span>
                  <button
                    onClick={handleCopyPassword}
                    className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
                    title="Copy Password"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="w-full bg-[#1a3a7c] text-white font-medium py-2.5 rounded-lg hover:bg-[#122859] transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={!!confirmResetId}
          title="Reset Password"
          message={`Apakah Anda yakin ingin mereset password untuk user "${confirmResetName}"?`}
          confirmText="Reset Password"
          isDanger={true}
          onConfirm={performResetPassword}
          onCancel={() => setConfirmResetId(null)}
          isLoading={isResetting}
        />

        <ConfirmModal
          isOpen={!!confirmDeleteId}
          title="Hapus User"
          message={`Apakah Anda yakin ingin menghapus user "${confirmDeleteName}"?`}
          confirmText="Hapus User"
          isDanger={true}
          onConfirm={performDeleteUser}
          onCancel={() => setConfirmDeleteId(null)}
          isLoading={isDeleting}
        />

        {/* Ubah Role Modal */}
        {roleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Ubah Role</h2>
                <button
                  onClick={() => setRoleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Ubah role untuk <strong className="text-gray-900">{editRoleUserName}</strong>:
                </p>
                <form onSubmit={performEditRole} className="space-y-4">
                  <div>
                    <select
                      value={editRoleValue}
                      onChange={(e) => setEditRoleValue(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRoleModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={roleSaving}
                      className="flex-1 bg-[#1a3a7c] text-white font-medium py-2.5 rounded-lg hover:bg-[#122859] transition-colors disabled:opacity-50"
                    >
                      {roleSaving ? "Menyimpan..." : "Simpan Role"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
