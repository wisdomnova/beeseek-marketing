"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import Image from "next/image";
import Leaderboard from "./components/Leaderboard";

export default function Home() {
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
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
            maxWidth: "1400px",
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
              gap: "5px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#000000",
            }}
          >
            <Image
              src="/beeseek.png"
              alt="BeeSeek"
              width={50}
              height={50}
              style={{ objectFit: "contain" }}
            />
            BeeSeek
          </div>

          <nav
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <a
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#549fe5",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              <LogIn size={18} />
              Login
            </a>
            <a
              href="/admin/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#549fe5",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              <UserPlus size={18} />
              Admin
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "60px 40px",
        }}
      >
        <div
          style={{
            marginBottom: "50px",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#000000",
              marginBottom: "12px",
            }}
          >
            Manager Leaderboard
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#6b7280",
              fontWeight: "400",
            }}
          >
            Track performance metrics across your management team
          </p>
        </div>

        {/* Leaderboard Component */}
        <Leaderboard />
      </main>
    </div>
  );
}
