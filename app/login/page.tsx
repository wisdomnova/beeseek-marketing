"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "48px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Back to Home Button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "transparent",
            color: "#549fe5",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <Image
            src="/beeseek.png"
            alt="BeeSeek"
            width={64}
            height={64}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Title */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            Manager Login
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Enter your password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#000000",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                color="#9ca3af"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 44px",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  outline: "none",
                  fontFamily: "Lato, sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#549fe5";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "24px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              backgroundColor: isLoading ? "#9ca3af" : "#549fe5",
              color: "#ffffff",
              padding: "14px",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {isLoading ? (
              "Logging in..."
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
