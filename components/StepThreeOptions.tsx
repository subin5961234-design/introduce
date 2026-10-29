"use client";

import React, { useState } from "react";
import { Sliders, Plus, X, Tag } from "lucide-react";
import { GenerationRequest } from "@/lib/types";

interface StepThreeOptionsProps {
  targetLength: number;
  setTargetLength: (val: number) => void;
  onApplyTargetLengthToAll?: (val: number) => void;
  tone: GenerationRequest["tone"];
  setTone: (val: GenerationRequest["tone"]) => void;
  subheadingStyle: GenerationRequest["subheadingStyle"];
  setSubheadingStyle: (val: GenerationRequest["subheadingStyle"]) => void;
  selectedKeywords: string[];
  setSelectedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}

const LENGTH_PRESETS = [300, 500, 700, 1000, 1500];

const POPULAR_KEYWORDS = [
  "문제해결력",
  "데이터기반의사결정",
  "협업및소통",
  "빠른실행력",
  "주도성",
  "비용절감",
  "고객중심사고",
  "프로세스개선",
];

export function StepThreeOptions({
  targetLength,
  setTargetLength,
  tone,
  setTone,
  subheadingStyle,
  setSubheadingStyle,
  selectedKeywords,
  setSelectedKeywords,
}: StepThreeOptionsProps) {
  const [isCustomLength, setIsCustomLength] = useState(
    !LENGTH_PRESETS.includes(targetLength)
  );
  const [customKeywordInput, setCustomKeywordInput] = useState("");

  const handleAddKeyword = () => {
    const trimmed = customKeywordInput.trim().replace(/^#/, "");
    if (trimmed && !selectedKeywords.includes(trimmed)) {
      setSelectedKeywords([...selectedKeywords, trimmed]);
      setCustomKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => {
    setSelectedKeywords(selectedKeywords.filter((k) => k !== kw));
  };

  const togglePopularKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== kw));
    } else {
      setSelectedKeywords([...selectedKeywords, kw]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
        <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center">
          3
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            글자 수 및 맞춤 생성 옵션
          </h2>
          <p className="text-xs text-gray-500">
            희망하는 글자 수와 서류 합격 어조를 선택하여 최적화된 결과물을 만드세요.
          </p>
        </div>
      </div>

      {/* Target Length Selector */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2">
          희망 글자 수 선택 (공백 포함, ±10% 정밀 제어)
        </label>
        <div className="flex flex-wrap gap-2">
          {LENGTH_PRESETS.map((preset) => {
            const isSelected = !isCustomLength && targetLength === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setIsCustomLength(false);
                  setTargetLength(preset);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-400"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {preset}자
                {preset === 700 && (
                  <span className="ml-1 text-[10px] font-normal opacity-90">
                    (기본)
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsCustomLength(true)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              isCustomLength
                ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-400"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            직접 입력
          </button>
        </div>

        {isCustomLength && (
          <div className="mt-3 flex items-center gap-2 max-w-xs">
            <input
              type="number"
              min={100}
              max={2500}
              step={50}
              value={targetLength}
              onChange={(e) => setTargetLength(Number(e.target.value))}
              className="w-32 px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
            <span className="text-xs text-gray-600 font-semibold">
              자 (100자 ~ 2,500자)
            </span>
          </div>
        )}
      </div>

      {/* Tone & Manner */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2">
          강조하고 싶은 어조 (Tone & Manner)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTone("professional")}
            className={`p-3 rounded-2xl border text-left transition ${
              tone === "professional"
                ? "border-amber-400 bg-amber-50/70 shadow-xs"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-sm">🌟</span>
            <p className="text-xs font-bold text-gray-900 mt-1">
              논리적 직무 전문가
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              차분하고 정돈된 톤, 사실과 데이터 중심
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTone("passionate")}
            className={`p-3 rounded-2xl border text-left transition ${
              tone === "passionate"
                ? "border-amber-400 bg-amber-50/70 shadow-xs"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-sm">🔥</span>
            <p className="text-xs font-bold text-gray-900 mt-1">
              진취적 도전 실행가
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              적극적 문제해결, 빠른 실행력과 몰입
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTone("collaborative")}
            className={`p-3 rounded-2xl border text-left transition ${
              tone === "collaborative"
                ? "border-amber-400 bg-amber-50/70 shadow-xs"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-sm">🤝</span>
            <p className="text-xs font-bold text-gray-900 mt-1">
              소통 중심 협업가
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              동료 피드백, 시너지 창출 및 경청
            </p>
          </button>
        </div>
      </div>

      {/* Subheading Style */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2">
          소제목 스타일
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setSubheadingStyle("impact_number")}
            className={`p-2.5 rounded-xl border text-left text-xs transition ${
              subheadingStyle === "impact_number"
                ? "border-amber-400 bg-amber-50 font-bold text-amber-900"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>[숫자/성과 임팩트형]</span>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
              예: [3초를 0.2초로: 데이터 튜닝]
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSubheadingStyle("job_core")}
            className={`p-2.5 rounded-xl border text-left text-xs transition ${
              subheadingStyle === "job_core"
                ? "border-amber-400 bg-amber-50 font-bold text-amber-900"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>[직무 역량 직관형]</span>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
              예: [사용자 중심 UI 아키텍처]
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSubheadingStyle("storytelling")}
            className={`p-2.5 rounded-xl border text-left text-xs transition ${
              subheadingStyle === "storytelling"
                ? "border-amber-400 bg-amber-50 font-bold text-amber-900"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>[스토리텔링 함축형]</span>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
              예: [병목에서 찾아낸 성장의 기회]
            </p>
          </button>
        </div>
      </div>

      {/* Keywords to highlight */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          강조하고 싶은 핵심 역량 태그
        </label>
        <p className="text-[11px] text-gray-500 mb-2.5">
          선택한 키워드가 자연스럽게 자기소개서 문맥에 녹아듭니다.
        </p>

        {/* Selected Keywords Chips */}
        {selectedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-amber-50/40 rounded-xl border border-amber-200/80">
            {selectedKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-2.5 py-1 rounded-lg shadow-2xs"
              >
                #{kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="hover:opacity-80 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Popular Tags Quick Click */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {POPULAR_KEYWORDS.map((kw, i) => {
            const isSelected = selectedKeywords.includes(kw);
            return (
              <button
                key={i}
                type="button"
                onClick={() => togglePopularKeyword(kw)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition ${
                  isSelected
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                +{kw}
              </button>
            );
          })}
        </div>

        {/* Custom Tag Input */}
        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="text"
            placeholder="직접 태그 입력 (예: 사용자경험)"
            value={customKeywordInput}
            onChange={(e) => setCustomKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
