"use client";

import { useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface AnimatedStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  delay?: number;
  gradient: string;
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  trend,
  delay = 0,
  gradient,
}: AnimatedStatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !valueRef.current) return;

    // Simple CSS animation instead of GSAP
    const card = cardRef.current;
    const valueEl = valueRef.current;

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
      valueEl.style.opacity = "1";
      valueEl.style.transform = "scale(1)";
    }, delay * 100);
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl"
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}
      />

      {/* Icon */}
      <div className="relative mb-4 flex items-center justify-between">
        <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend !== undefined && (
          <div
            className={`text-sm font-semibold ${
              trend >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        <div className="mb-1 text-sm font-medium text-gray-400">{title}</div>
        <div
          ref={valueRef}
          className="text-3xl font-bold text-white"
          style={{
            opacity: 0,
            transform: "scale(0.8)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
          }}
        >
          {value}
        </div>
      </div>

      {/* Shine effect */}
      <div className="animate-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
