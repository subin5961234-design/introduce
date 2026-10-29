"use client";

import React, { useState } from "react";
import {
  FileQuestion,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { QuestionDefinition } from "@/lib/types";
import { DEFAULT_INITIAL_QUESTIONS } from "@/lib/sample-data";

interface StepTwoQuestionsProps {
  questions: QuestionDefinition[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDefinition[]>>;
}

const QUESTION_PRESET_OPTIONS = [
  "1. 당사에 지원하게 된 동기와, 지원 직무를 성공적으로 수행하기 위해 갖춘 본인만의 핵심 역량 및 준비 과정을 기술해주세요.",
  "2. 직면했던 가장 큰 난관이나 기술적 한계를 주도적으로 극복하고, 성과를 창출했던 경험(STAR)을 구체적인 행동 중심으로 기술해주세요.",
  "3. 공동의 목표를 달성하는 과정에서 발생한 의견 차이나 소통의 어려움을 슬기롭게 조율하고 팀 시너지를 이끌어낸 경험을 기술해주세요.",
  "4. 입사 후 달성하고 싶은 직무적 목표와, 본인의 역량을 발휘하여 당사의 비즈니스 성장에 구체적으로 어떻게 기여할 것인지 서술해주세요.",
  "5. 본인의 직업관이나 가치관에 가장 큰 영향을 준 경험과, 이것이 직무 수행에 미치는 긍정적 영향을 기술해주세요.",
  "6. 실패를 겪었던 경험과 이를 극복하는 과정에서 얻은 교훈이 현재의 역량으로 발전된 사례를 서술해주세요.",
  "직접 입력",
];

const LENGTH_PRESETS = [300, 500, 700, 1000, 1500];

export function StepTwoQuestions({
  questions,
  setQuestions,
}: StepTwoQuestionsProps) {
  const updateQuestion = (idx: number, field: keyof QuestionDefinition, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  const handleSelectChange = (idx: number, selectedValue: string) => {
    if (selectedValue === "직접 입력") {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === idx ? { ...q, question: "", isCustom: true } : q
        )
      );
    } else {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === idx ? { ...q, question: selectedValue, isCustom: false } : q
        )
      );
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: "",
        targetLength: 700,
        isCustom: true,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert("최소 1개 이상의 문항이 필요합니다.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleResetToStandard = () => {
    if (confirm("표준 4개 문항 세트로 재설정하시겠습니까?")) {
      setQuestions(DEFAULT_INITIAL_QUESTIONS);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-900 font-black text-sm flex items-center justify-center">
            2
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                자기소개서 문항 목록 (질문 세트)
              </h2>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                총 {questions.length}개 문항 답변 일괄 생성
              </span>
            </div>
            <p className="text-xs text-gray-500">
              지원할 기업의 자소서 문항을 원하는 만큼 추가하세요. &apos;직접 입력&apos;을 선택하면 나만의 질문을 바로 작성할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            문항 추가하기
          </button>

          <button
            type="button"
            onClick={handleResetToStandard}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
            title="표준 4개 문항으로 재설정"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List of Question Items */}
      <div className="space-y-4">
        {questions.map((item, idx) => {
          const isPreset = QUESTION_PRESET_OPTIONS.slice(0, 6).includes(item.question);
          const isCustomMode = item.isCustom ?? !isPreset;
          const selectValue = isCustomMode ? "직접 입력" : item.question;

          return (
            <div
              key={item.id || idx}
              className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-200 hover:border-amber-300 transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    문항 {idx + 1} 질문 설정
                  </span>
                  {isCustomMode && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded">
                      직접 입력
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Target length preset selector */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                    <span>목표:</span>
                    {LENGTH_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateQuestion(idx, "targetLength", preset)}
                        className={`px-2 py-0.5 rounded-md transition ${
                          item.targetLength === preset
                            ? "bg-amber-500 text-white font-bold"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {preset}자
                      </button>
                    ))}
                    <input
                      type="number"
                      min={100}
                      max={2500}
                      step={50}
                      value={item.targetLength}
                      onChange={(e) =>
                        updateQuestion(idx, "targetLength", Number(e.target.value))
                      }
                      className="w-16 px-1.5 py-0.5 bg-white border border-gray-300 rounded text-center text-xs"
                    />
                    <span>자</span>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="문항 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Dropdown */}
              <div className="relative">
                <select
                  value={selectValue}
                  onChange={(e) => handleSelectChange(idx, e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition cursor-pointer ${
                    isCustomMode
                      ? "border-amber-300 text-amber-900 font-bold bg-amber-50/20"
                      : "border-gray-200 text-gray-800 font-medium"
                  }`}
                >
                  <option value="직접 입력">✍️ 직접 입력 (원하는 자소서 질문 자유 입력)</option>
                  <optgroup label="── 자주 묻는 추천 문항 프리셋 ──">
                    {QUESTION_PRESET_OPTIONS.slice(0, 6).map((p, pIdx) => (
                      <option key={pIdx} value={p}>
                        {p}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Editable Question Textarea with Gray Placeholder */}
              <div className="relative">
                <textarea
                  rows={2}
                  value={item.question}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isStillPreset = QUESTION_PRESET_OPTIONS.slice(0, 6).includes(val);
                    setQuestions((prev) =>
                      prev.map((q, i) =>
                        i === idx
                          ? { ...q, question: val, isCustom: !isStillPreset }
                          : q
                      )
                    );
                  }}
                  placeholder="예: 1. 당사에 지원한 동기와 지원 직무를 성공적으로 수행하기 위한 준비 과정을 기술해주세요."
                  className="w-full px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
                {item.question.length > 0 && isCustomMode && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((prev) =>
                        prev.map((q, i) =>
                          i === idx ? { ...q, question: "", isCustom: true } : q
                        )
                      )
                    }
                    className="absolute right-2.5 top-2.5 text-[10px] text-gray-400 hover:text-red-500 bg-white/90 px-1.5 py-0.5 rounded border border-gray-200 transition"
                    title="질문 내용 지우기"
                  >
                    지우기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          💡 총 <strong>{questions.length}개</strong> 문항에 대해 한 번에 답변을 받으실 수 있습니다.
        </span>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-900"
        >
          <Plus className="w-3.5 h-3.5" />
          문항 추가하기
        </button>
      </div>
    </div>
  );
}
