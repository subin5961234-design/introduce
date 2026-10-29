"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StarCraftMascot } from "./StarCraftMascot";
import { HEALING_MESSAGES } from "@/lib/sample-data";
import { Sparkles, CheckCircle2, Coffee } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  companyName: string;
  roleName: string;
  targetLength: number;
  questionCount?: number;
}

const STAGES = [
  { label: "채용공고 핵심 역량 및 인재상 분석 중", icon: "🔍" },
  { label: "지원자의 STAR 경험 인과관계 및 행동 구조화 중", icon: "🧩" },
  { label: "서류 심사위원 마음을 사로잡을 격식체 윤문 중", icon: "✍️" },
  { label: "목표 글자 수 및 소제목 정밀 피팅 중", icon: "🎯" },
];

export function LoadingModal({
  isOpen,
  companyName,
  roleName,
  targetLength,
  questionCount = 4,
}: LoadingModalProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Rotate healing messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % HEALING_MESSAGES.length);
    }, 3200);

    // Increment simulated stage
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(stageInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center border-2 border-amber-300 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl" />

        {/* Mascot Animation */}
        <div className="relative mb-4 flex justify-center">
          <StarCraftMascot mood="working" size={130} />
        </div>

        {/* Headline */}
        <h3 className="text-xl font-black text-gray-900 mb-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
          <span>마법의 자기소개서 일괄 작성 중!</span>
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          {companyName ? `${companyName} ` : ""}
          {roleName ? `[${roleName}]` : ""} • 총 {questionCount}개 문항 전체 생성
        </p>

        {/* Dynamic Progress Stages */}
        <div className="bg-amber-50/60 rounded-2xl p-3.5 mb-5 border border-amber-200/60 text-left space-y-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-all ${
                  isCurrent
                    ? "font-bold text-amber-900"
                    : isCompleted
                    ? "text-emerald-700 opacity-80"
                    : "text-gray-400 opacity-50"
                }`}
              >
                <span className="text-sm shrink-0">{stage.icon}</span>
                <span className="flex-1 truncate">{stage.label}</span>
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Healing & Cheering Box */}
        <div className="h-16 flex items-center justify-center px-4 bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 rounded-2xl border border-amber-200">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-xs font-semibold text-gray-700 leading-relaxed text-center"
            >
              {HEALING_MESSAGES[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Coffee className="w-3.5 h-3.5" />
          <span>잠시만 편안하게 기다려주세요 (약 5~10초)</span>
        </div>
      </div>
    </div>
  );
}
