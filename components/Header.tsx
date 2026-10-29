"use client";

import React from "react";
import { StarCraftMascot } from "./StarCraftMascot";
import { Bookmark, HelpCircle, RotateCcw, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  onOpenVault: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  vaultCount: number;
  lastSavedAt: string | null;
}

export function Header({
  onOpenVault,
  onOpenGuide,
  onReset,
  vaultCount,
  lastSavedAt,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none">
          <StarCraftMascot mood="happy" size={44} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900">
                STAR-Craft
              </h1>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                자소서 오토 ✨
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              STAR 경험 기반 AI 맞춤형 자기소개서 빌더
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Autosave status indicator */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>자동 저장됨</span>
            {lastSavedAt && (
              <span className="text-[10px] text-emerald-600/70 font-mono">
                ({lastSavedAt})
              </span>
            )}
          </div>

          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-2 rounded-xl transition"
            title="STAR 작성 가이드"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">STAR 가이드</span>
          </button>

          <button
            onClick={onOpenVault}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-gray-900 bg-amber-400 hover:bg-amber-500 px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95"
            title="나만의 STAR 경험 보관함"
          >
            <Bookmark className="w-4 h-4 fill-amber-900 text-amber-900" />
            <span>경험 보관함</span>
            <span className="w-4 h-4 rounded-full bg-amber-950 text-white text-[10px] flex items-center justify-center font-bold">
              {vaultCount}
            </span>
          </button>

          <button
            onClick={() => {
              if (confirm("입력 중인 내용을 초기화하시겠습니까?")) {
                onReset();
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
            title="새로 작성 (폼 초기화)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
