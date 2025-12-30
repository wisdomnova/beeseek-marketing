"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Manager {
  id: number;
  name: string;
  contacts_messaged: number;
  contacts_converted: number;
  days_missed: number;
  days_completed: number;
  conversion_rate: number;
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flex: 1,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        backgroundColor: "#f3f4f6",
        borderRadius: "6px",
      }}
    >
      <Icon size={20} color="#549fe5" />
    </div>
    <div>
      <p
        style={{
          fontSize: "12px",
          color: "#9ca3af",
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: "2px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#000000",
        }}
      >
        {value}
      </p>
      {subtext && (
        <p
          style={{
            fontSize: "11px",
            color: "#6b7280",
            marginTop: "2px",
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  </div>
);

export default function Leaderboard() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .order('conversion_rate', { ascending: false });

      if (error) throw error;

      if (data) {
        setManagers(data);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ fontSize: "16px", color: "#6b7280" }}>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
      }}
    >
      {managers.map((manager, index) => (
        <motion.div
          key={manager.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          {/* Rank Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#000000",
                  marginBottom: "4px",
                  textTransform: "capitalize",
                }}
              >
                {manager.name}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Rank #{index + 1}
              </p>
            </div>
            <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              backgroundColor: index === 0 ? "#549fe5" : "#f3f4f6",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "700",
              color: index === 0 ? "#ffffff" : "#000000",
            }}
          >
            #{index + 1}
          </div>
          </div>

          {/* Conversion Rate Highlight */}
          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "600",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Conversion Rate
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "#549fe5",
              }}
            >
              {manager.conversion_rate.toFixed(1)}%
            </p>
          </div>

          {/* Metrics */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <MetricCard
              icon={MessageSquare}
              label="Contacts Messaged"
              value={manager.contacts_messaged}
            />
            <MetricCard
              icon={TrendingUp}
              label="Contacts Converted"
              value={manager.contacts_converted}
            />
            <MetricCard
              icon={Calendar}
              label="Days Missed"
              value={manager.days_missed}
            />
            <MetricCard
              icon={CheckCircle}
              label="Days Completed"
              value={manager.days_completed}
              subtext="out of 30"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
