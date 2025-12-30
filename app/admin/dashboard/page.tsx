"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  Database,
  Activity,
} from "lucide-react";
import Image from "next/image";

interface Manager {
  id: number;
  name: string;
  contacts_messaged: number;
  contacts_converted: number;
  days_missed: number;
  days_completed: number;
  conversion_rate: number;
}

interface Contact {
  id: number;
  assigned_at: string;
  expires_at: string;
  messaged: boolean;
  converted: boolean;
  rejected: boolean;
  messaged_at: string | null;
  converted_at: string | null;
  rejected_at: string | null;
  managers: { name: string };
  contacts: {
    contact_id: string;
    username: string;
    business: string;
    social_media: string;
    profile_link: string;
    location: string;
  };
}

interface Stats {
  totalContactsInPool: number;
  totalAssignments: number;
  totalMessaged: number;
  totalConverted: number;
  totalRejected: number;
  totalPending: number;
  activeAssignments: number;
  expiredUnmessaged: number;
  overallConversionRate: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    contact_id: "",
    username: "",
    business: "",
    social_media: "",
    profile_link: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/me");
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.managers) {
        setManagers(data.managers);
        setContacts(data.contacts);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Auto-generate contact_id if empty
      const contactData = {
        ...newContact,
        contact_id: newContact.contact_id || `C${Date.now().toString().slice(-8)}`,
      };

      const response = await fetch("/api/admin/add-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setNewContact({
          contact_id: "",
          username: "",
          business: "",
          social_media: "",
          profile_link: "",
          location: "",
        });
        fetchStats();
      } else {
        alert(data.error || "Failed to add contact");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <p style={{ fontSize: "16px", color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div
          style={{
            backgroundColor: `${color}15`,
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <Icon size={24} color={color} />
        </div>
        <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600" }}>{label}</p>
      </div>
      <p style={{ fontSize: "32px", fontWeight: "900", color: "#000000" }}>{value}</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#000000",
            }}
          >
            <Image
              src="/beeseek.png"
              alt="BeeSeek"
              width={32}
              height={32}
              style={{ objectFit: "contain" }}
            />
            BeeSeek Admin
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#10b981",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <Plus size={18} />
              Add Contact
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                color: "#549fe5",
                padding: "10px 20px",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                border: "1px solid #549fe5",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#549fe5";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#549fe5";
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "900",
            color: "#000000",
            marginBottom: "32px",
          }}
        >
          Dashboard Overview
        </h1>

        {/* Stats Grid */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <StatCard icon={Database} label="Contacts in Pool" value={stats.totalContactsInPool} color="#549fe5" />
            <StatCard icon={Activity} label="Total Assignments" value={stats.totalAssignments} color="#8b5cf6" />
            <StatCard icon={MessageSquare} label="Total Messaged" value={stats.totalMessaged} color="#3b82f6" />
            <StatCard icon={CheckCircle} label="Total Converted" value={stats.totalConverted} color="#10b981" />
            <StatCard icon={XCircle} label="Total Rejected" value={stats.totalRejected} color="#ef4444" />
            <StatCard icon={Clock} label="Pending" value={stats.totalPending} color="#f59e0b" />
            <StatCard icon={Users} label="Active Assignments" value={stats.activeAssignments} color="#06b6d4" />
            <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.overallConversionRate}%`} color="#10b981" />
          </div>
        )}

        {/* Managers Section */}
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#000000",
              marginBottom: "20px",
            }}
          >
            Manager Performance
          </h2>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Manager
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Messaged
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Converted
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Days Missed
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Days Completed
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager, index) => (
                  <tr
                    key={manager.id}
                    style={{
                      borderBottom: index < managers.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <td style={{ padding: "16px", fontSize: "14px", color: "#000000", fontWeight: "600", textTransform: "capitalize" }}>
                      {manager.name}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#000000", textAlign: "center" }}>
                      {manager.contacts_messaged}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#10b981", textAlign: "center", fontWeight: "600" }}>
                      {manager.contacts_converted}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#ef4444", textAlign: "center" }}>
                      {manager.days_missed}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#10b981", textAlign: "center" }}>
                      {manager.days_completed}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#549fe5", textAlign: "center", fontWeight: "700" }}>
                      {manager.conversion_rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Contacts Section */}
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#000000",
              marginBottom: "20px",
            }}
          >
            All Contact Assignments ({contacts.length})
          </h2>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              maxHeight: "600px",
              overflowY: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f3f4f6", zIndex: 1 }}>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Contact
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Business
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Location
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Manager
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Assigned
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Status
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Messaged
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => {
                  const isExpired = new Date(contact.expires_at) < new Date();
                  return (
                    <tr
                      key={contact.id}
                      style={{
                        borderBottom: index < contacts.length - 1 ? "1px solid #e5e7eb" : "none",
                        backgroundColor: isExpired && !contact.messaged ? "#fef3c7" : "transparent",
                      }}
                    >
                      <td style={{ padding: "16px", fontSize: "14px", color: "#000000" }}>
                        <div>
                          <p style={{ fontWeight: "600" }}>{contact.contacts.username}</p>
                          <p style={{ fontSize: "12px", color: "#6b7280" }}>{contact.contacts.contact_id}</p>
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>
                        {contact.contacts.business || "-"}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>
                        {contact.contacts.location || "-"}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#000000", fontWeight: "600", textTransform: "capitalize" }}>
                        {contact.managers.name}
                      </td>
                      <td style={{ padding: "16px", fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
                        {new Date(contact.assigned_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            backgroundColor: isExpired ? "#fee2e2" : "#d1fae5",
                            color: isExpired ? "#991b1b" : "#065f46",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {contact.messaged ? (
                          <CheckCircle size={18} color="#10b981" style={{ margin: "0 auto", display: "block" }} />
                        ) : (
                          <XCircle size={18} color="#9ca3af" style={{ margin: "0 auto", display: "block" }} />
                        )}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {contact.converted && (
                          <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                            Converted
                          </span>
                        )}
                        {contact.rejected && !contact.converted && (
                          <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                            Rejected
                          </span>
                        )}
                        {!contact.converted && !contact.rejected && contact.messaged && (
                          <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                            Pending
                          </span>
                        )}
                        {!contact.messaged && (
                          <span style={{ color: "#9ca3af", fontSize: "11px" }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#000000",
                marginBottom: "24px",
              }}
            >
              Add New Contact
            </h2>
            <form onSubmit={handleAddContact}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#000000", marginBottom: "8px" }}>
                  Contact ID <span style={{ color: "#6b7280", fontWeight: "400" }}>(optional - auto-generated if empty)</span>
                </label>
                <input
                  type="text"
                  value={newContact.contact_id}
                  onChange={(e) => setNewContact({ ...newContact, contact_id: e.target.value })}
                  placeholder="Leave empty to auto-generate (e.g., C12345678)"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    outline: "none",
                    fontFamily: "Lato, sans-serif",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#000000", marginBottom: "8px" }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={newContact.username}
                  onChange={(e) => setNewContact({ ...newContact, username: e.target.value })}
                  placeholder="e.g., @username"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    outline: "none",
                    fontFamily: "Lato, sans-serif",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#000000", marginBottom: "8px" }}>
                  Business
                </label>
                <input
                  type="text"
                  value={newContact.business}
                  onChange={(e) => setNewContact({ ...newContact, business: e.target.value })}
                  placeholder="e.g., Tech Startup"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    outline: "none",
                    fontFamily: "Lato, sans-serif",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#000000", marginBottom: "8px" }}>
                  Social Media Platform
                </label>
                <input
                  type="text"
                  value={newContact.social_media}
                  onChange={(e) => setNewContact({ ...newContact, social_media: e.target.value })}
                  placeholder="e.g., Twitter, Instagram"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    outline: "none",
                    fontFamily: "Lato, sans-serif",
                  }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#000000", marginBottom: "8px" }}>
                  Profile Link
                </label>
                <input
                  type="url"
                  value={newContact.profile_link}
                  onChange={(e) => setNewContact({ ...newContact, profile_link: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    outline: "none",
                    fontFamily: "Lato, sans-serif",
                  }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#000000", marginBottom: "8px" }}>
                  Location
                </label>
                <input
                  type="text"
                  value={newContact.location}
                  onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                  placeholder="Lagos, Nigeria"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    outline: "none",
                    fontFamily: "Lato, sans-serif",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "#f3f4f6",
                    color: "#000000",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    backgroundColor: isSubmitting ? "#9ca3af" : "#10b981",
                    color: "#ffffff",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
