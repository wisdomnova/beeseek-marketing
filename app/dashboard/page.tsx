"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Clock, MessageSquare, CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import Image from "next/image";

interface User {
  name: string;
  id: number;
}

interface Contact {
  id: number;
  contact_id: number;
  assigned_at: string;
  expires_at: string;
  messaged: boolean;
  converted: boolean;
  rejected: boolean;
  messaged_at: string | null;
  converted_at: string | null;
  rejected_at: string | null;
  notes: string | null;
  contacts: {
    contact_id: string;
    username: string;
    business: string;
    social_media: string;
    profile_link: string;
    location: string;
  };
}

interface TimerData {
  hoursRemaining: number;
  minutesRemaining: number;
  totalSeconds: number;
  fetchedAt?: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timer, setTimer] = useState<TimerData | null>(null);
  const [timeDisplay, setTimeDisplay] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchContacts();
      fetchTimer();
      const interval = setInterval(() => {
        fetchTimer();
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (timer) {
      updateTimeDisplay();
      const interval = setInterval(updateTimeDisplay, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const updateTimeDisplay = () => {
    if (!timer || !timer.fetchedAt) return;
    
    const now = Date.now();
    const elapsedSince = Math.floor((now - timer.fetchedAt) / 1000);
    const remainingSeconds = Math.max(0, timer.totalSeconds - elapsedSince);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    
    setTimeDisplay(`${hours}h ${minutes}m ${secs}s`);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (skipAutoAssign: boolean = false) => {
    try {
      const url = skipAutoAssign ? "/api/contacts?skipAutoAssign=true" : "/api/contacts";
      const response = await fetch(url);
      const data = await response.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchTimer = async () => {
    try {
      const response = await fetch("/api/contacts/timer");
      const data = await response.json();
      if (data.hoursRemaining !== undefined) {
        setTimer({ ...data, fetchedAt: Date.now() });
      }
    } catch (error) {
      console.error("Error fetching timer:", error);
    }
  };

  const handleContactAction = async (
    managerContactId: number,
    action: "message" | "convert" | "reject"
  ) => {
    // Show confirmation popup
    let confirmMessage = "";
    if (action === "message") {
      confirmMessage = "Mark this contact as messaged? This means you've reached out to them.";
    } else if (action === "convert") {
      confirmMessage = "Mark this contact as CONVERTED? This means they became a customer!";
    } else if (action === "reject") {
      confirmMessage = "Mark this contact as REJECTED? This means they're not interested.";
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerContactId, action }),
      });

      if (response.ok) {
        await fetchContacts(true);
        
        // Show success message
        if (action === "message") {
          alert("Contact marked as messaged! You can now convert or reject them.");
        } else if (action === "convert") {
          alert("Awesome! Contact marked as converted!");
        } else if (action === "reject") {
          alert("Contact marked as rejected.");
        }
      } else {
        alert("Failed to update contact. Please try again.");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
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

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "clamp(12px, 3vw, 24px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(4px, 1vw, 6px)",
              fontSize: "clamp(16px, 4vw, 24px)",
              fontWeight: "700",
              color: "#000000",
            }}
          >
            <Image
              src="/beeseek.png"
              alt="BeeSeek"
              width={50}
              height={50}
              style={{ objectFit: "contain", maxWidth: "clamp(30px, 8vw, 40px)" }}
            />
            BeeSeek
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 2vw, 16px)",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: "clamp(11px, 2vw, 14px)",
                fontWeight: "600",
                color: "#000000",
              }}
            >
              Welcome,{" "}
              <span
                style={{ color: "#549fe5", textTransform: "capitalize" }}
              >
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(4px, 1vw, 8px)",
                backgroundColor: "#ffffff",
                color: "#549fe5",
                padding: "clamp(6px, 1.5vw, 10px) clamp(12px, 2.5vw, 20px)",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "clamp(11px, 2vw, 14px)",
                cursor: "pointer",
                border: "1px solid #549fe5",
                whiteSpace: "nowrap",
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
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(24px, 6vw, 40px)",
        }}
      >
        {/* Timer Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "clamp(16px, 4vw, 24px)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "clamp(12px, 3vw, 20px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)" }}>
              <Clock size={20} color="#549fe5" style={{ minWidth: "20px" }} />
              <div>
                <p
                  style={{
                    fontSize: "clamp(12px, 2vw, 14px)",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Time Until End of Day Refresh
                </p>
                <p
                  style={{
                    fontSize: "clamp(18px, 5vw, 24px)",
                    fontWeight: "700",
                    color: "#000000",
                  }}
                >
                  {timeDisplay || "Loading..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchContacts()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#f3f4f6",
                color: "#000000",
                padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "clamp(12px, 2vw, 14px)",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
            >
              <RefreshCw size={18} style={{ minWidth: "18px" }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "clamp(16px, 3vw, 24px)" }}>
          <h1
            style={{
              fontSize: "clamp(24px, 6vw, 32px)",
              fontWeight: "900",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            Your Contact List
          </h1>
          <p
            style={{
              fontSize: "clamp(12px, 2.5vw, 14px)",
              color: "#6b7280",
            }}
          >
            You have {contacts.length} contacts. Message new contacts before the timer runs out. Messaged contacts stay with you.
          </p>
        </div>

        {/* Contacts Table */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Contact ID
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Username
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Business
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Location
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Platform
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Profile
                </th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Status
                </th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
                <tr
                  key={contact.id}
                  style={{
                    borderBottom: index < contacts.length - 1 ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <td style={{ padding: "16px", fontSize: "14px", color: "#000000", fontWeight: "600" }}>
                    {contact.contacts.contact_id}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#000000" }}>
                    {contact.contacts.username}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>
                    {contact.contacts.business}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>
                    {contact.contacts.location || "-"}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>
                    {contact.contacts.social_media}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <a
                      href={contact.contacts.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#549fe5",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      <ExternalLink size={16} />
                      View
                    </a>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      {contact.converted && (
                        <div
                          style={{
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Converted
                        </div>
                      )}
                      {contact.rejected && !contact.converted && (
                        <div
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Rejected
                        </div>
                      )}
                      {contact.messaged && !contact.converted && !contact.rejected && (
                        <div
                          style={{
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Messaged
                        </div>
                      )}
                      {!contact.messaged && (
                        <div
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#6b7280",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Pending
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      {!contact.messaged && (
                        <button
                          onClick={() => handleContactAction(contact.id, "message")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "#549fe5",
                            color: "#ffffff",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                        >
                          <MessageSquare size={14} />
                          Message
                        </button>
                      )}
                      {contact.messaged && !contact.converted && !contact.rejected && (
                        <>
                          <button
                            onClick={() => handleContactAction(contact.id, "convert")}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              backgroundColor: "#10b981",
                              color: "#ffffff",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "0.9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <CheckCircle size={14} />
                            Convert
                          </button>
                          <button
                            onClick={() => handleContactAction(contact.id, "reject")}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              backgroundColor: "#ef4444",
                              color: "#ffffff",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "0.9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {contacts.length === 0 && (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "16px" }}>
                No contacts available. Click refresh to get your contact list.
              </p>
              <button
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#549fe5",
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
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
            </div>
        </div>
      </main>
    </div>
  );
}
