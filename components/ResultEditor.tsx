"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  FileText,
  Download,
  Sparkles,
  Scissors,
  Maximize2,
  Briefcase,
  RefreshCw,
  MessageSquare,
  ArrowLeft,
  BookmarkPlus,
  SlidersHorizontal,
  Layers,
  FileCheck,
} from "lucide-react";
import { GeneratedQuestionResult, GenerationResponse, RewriteRequest } from "@/lib/types";
import { downloadDocx } from "@/lib/docx-export";

interface ResultEditorProps {
  company: string;
  role: string;
  initialResult: GenerationResponse;
  onBackToForm: () => void;
  onSaveToVault?: (title: string) => void;
}

export function ResultEditor({
  company,
  role,
  initialResult,
  onBackToForm,
  onSaveToVault,
}: ResultEditorProps) {
  // Normalize items array
  const initialItems: GeneratedQuestionResult[] =
    initialResult.items && initialResult.items.length > 0
      ? initialResult.items
      : [
          {
            id: "q-1",
            question: "1. 지원 직무 관련 핵심 역량 및 준비 과정",
            title: initialResult.title || "[지원동기 및 직무 역량]",
            content: initialResult.content || "",
            targetLength: 700,
            charCount: initialResult.content?.length || 0,
            charCountNoSpaces: initialResult.content?.replace(/\s/g, "").length || 0,
            keyHighlights: initialResult.keyHighlights || [],
            feedback: initialResult.feedback || "",
          },
        ];

  const [items, setItems] = useState<GeneratedQuestionResult[]>(initialItems);
  const [activeTab, setActiveTab] = useState<number | "all">(0);

  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSavedToVault, setIsSavedToVault] = useState(false);

  // Active item if not "all"
  const currentIdx = typeof activeTab === "number" ? activeTab : 0;
  const currentItem = items[currentIdx] || items[0];

  // Helper to update a field on an item
  const updateItemField = (index: number, field: keyof GeneratedQuestionResult, val: any) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        const updated = { ...it, [field]: val };
        if (field === "content") {
          updated.charCount = (val || "").length;
          updated.charCountNoSpaces = (val || "").replace(/\s/g, "").length;
        }
        return updated;
      })
    );
  };

  // Character calculations for current item
  const charCountWithSpaces = currentItem?.content?.length || 0;
  const charCountNoSpaces = currentItem?.content?.replace(/\s/g, "").length || 0;
  const targetLength = currentItem?.targetLength || 700;
  const percentOfTarget = targetLength
    ? Math.round((charCountWithSpaces / targetLength) * 100)
    : 100;
  const isWithinTolerance =
    charCountWithSpaces >= targetLength * 0.9 &&
    charCountWithSpaces <= targetLength * 1.1;

  // Total chars across all items
  const totalCharsWithSpaces = items.reduce(
    (acc, it) => acc + (it.content?.length || 0),
    0
  );
  const totalCharsNoSpaces = items.reduce(
    (acc, it) => acc + (it.content?.replace(/\s/g, "").length || 0),
    0
  );

  // Copy active question or all
  const handleCopyCurrent = async () => {
    const text = `${currentItem.question}\n\n${
      currentItem.title ? `${currentItem.title}\n\n` : ""
    }${currentItem.content}`;
    await navigator.clipboard.writeText(text);
    setCopiedState("current");
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleCopyAll = async () => {
    const fullText = items
      .map((it, idx) => {
        const titleLine = it.title ? `${it.title}\n\n` : "";
        return `[문항 ${idx + 1}] ${it.question}\n\n${titleLine}${it.content}`;
      })
      .join("\n\n────────────────────────────────────────\n\n");

    await navigator.clipboard.writeText(fullText);
    setCopiedState("all");
    setTimeout(() => setCopiedState(null), 2000);
  };

  // Word (.docx) export for all questions
  const handleDownloadDocx = async () => {
    await downloadDocx({
      company,
      role,
      items,
    });
  };

  // PDF Export via Browser Print View
  const handleDownloadPdf = () => {
    window.print();
  };

  // Handle AI Rewriting on the active item
  const handleRewrite = async (
    action: RewriteRequest["action"],
    customText?: string
  ) => {
    if (!currentItem) return;
    setIsRewriting(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          question: currentItem.question,
          title: currentItem.title,
          content: currentItem.content,
          action,
          customInstruction: customText,
          targetLength: currentItem.targetLength,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "재작성에 실패했습니다.");
      }

      const data = await res.json();
      setItems((prev) =>
        prev.map((it, idx) => {
          if (idx !== currentIdx) return it;
          return {
            ...it,
            title: data.title || it.title,
            content: data.content || it.content,
            charCount: (data.content || it.content).length,
            charCountNoSpaces: (data.content || it.content).replace(/\s/g, "").length,
            feedback: data.feedback || it.feedback,
          };
        })
      );
    } catch (err: any) {
      alert(err.message || "재작성 중 오류가 발생했습니다.");
    } finally {
      setIsRewriting(false);
      setShowCustomPromptModal(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={onBackToForm}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          입력 내용 수정하기
        </button>

        <div className="flex items-center gap-2">
          {onSaveToVault && (
            <button
              onClick={() => {
                onSaveToVault(`${company} ${role} 자소서 패키지`);
                setIsSavedToVault(true);
                setTimeout(() => setIsSavedToVault(false), 2500);
              }}
              disabled={isSavedToVault}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition"
            >
              <BookmarkPlus className="w-4 h-4 text-amber-700" />
              {isSavedToVault ? "보관함에 저장됨!" : "보관함에 저장"}
            </button>
          )}

          <button
            onClick={handleCopyCurrent}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition active:scale-95"
            title="현재 선택된 문항 복사"
          >
            {copiedState === "current" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">문항 복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-600" />
                현재 문항 복사
              </>
            )}
          </button>

          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-3.5 py-2 rounded-xl transition active:scale-95 shadow-2xs"
            title="모든 문항을 하나로 합쳐서 복사"
          >
            {copiedState === "all" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800 font-bold">전체 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-800" />
                전체 문항 복사
              </>
            )}
          </button>
        </div>
      </div>

      {/* Questions Multi-Tab Navigation */}
      <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {items.map((item, idx) => {
          const isSelected = activeTab === idx;
          const chars = item.content?.length || 0;

          return (
            <button
              key={item.id || idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-200"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                  isSelected ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {idx + 1}
              </span>
              <span>문항 {idx + 1}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? "bg-amber-600/70 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {chars}자
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
            activeTab === "all"
              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
              : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>전체 문서 보기</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
            총 {items.length}개
          </span>
        </button>
      </div>

      {/* Main Document Content Area */}
      {activeTab === "all" ? (
        /* ALL QUESTIONS BINDER VIEW */
        <div
          id="printable-cv"
          className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-xl p-6 sm:p-10 space-y-8"
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                {company || "지원기업"} • {role || "지원직무"} 입사지원서
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                총 {items.length}개 문항 | 전체 글자 수: 공백 포함{" "}
                <strong className="text-amber-700">{totalCharsWithSpaces.toLocaleString()}자</strong> (공백 제외 {totalCharsNoSpaces.toLocaleString()}자)
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              전체 자기소개서 종합 패키지
            </h2>
          </div>

          {/* Sequential List of Questions */}
          <div className="space-y-8">
            {items.map((it, idx) => (
              <div
                key={it.id || idx}
                className="p-6 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">
                      {it.question}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    글자 수: <strong>{(it.content?.length || 0).toLocaleString()}자</strong> / 목표 {it.targetLength}자
                  </span>
                </div>

                {/* Matched Experience */}
                {it.matchedExperienceTitle && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-900 bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-200/80">
                    <span className="font-bold text-blue-950">🎯 매칭 경험:</span>
                    <span className="font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                      {it.matchedExperienceTitle}
                    </span>
                    {it.matchReason && (
                      <span className="text-[11px] text-blue-700 ml-1">
                        - {it.matchReason}
                      </span>
                    )}
                  </div>
                )}

                {/* Subtitle */}
                <h4 className="text-base font-bold text-blue-900">
                  {it.title.startsWith("[") ? it.title : `[${it.title}]`}
                </h4>

                {/* Body Content */}
                <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-line font-sans">
                  {it.content}
                </div>

                {/* Highlights */}
                {it.keyHighlights && it.keyHighlights.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {it.keyHighlights.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-white text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SINGLE QUESTION EDIT VIEW */
        <div
          id="printable-cv"
          className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-xl p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Header Metadata */}
          <div className="border-b border-gray-200 pb-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                {company || "지원기업"} • {role || "지원직무"}
              </span>
              <span className="text-xs text-gray-400">
                문항 {currentIdx + 1} / 총 {items.length}개 | 실시간 편집 가능
              </span>
            </div>

            <h2 className="text-sm font-semibold text-gray-800 mb-1">
              <span className="text-amber-600 font-bold mr-1.5">[문항 {currentIdx + 1}]</span>
              {currentItem.question}
            </h2>
          </div>

          {/* AI Matched Experience Badge */}
          {currentItem.matchedExperienceTitle && (
            <div className="mb-5 p-3 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5">
              <span className="text-base shrink-0">🎯</span>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-blue-950">AI 최적 선별 경험:</span>
                  <span className="font-bold text-blue-800 bg-white px-2 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                    {currentItem.matchedExperienceTitle}
                  </span>
                </div>
                {currentItem.matchReason && (
                  <p className="text-blue-900 mt-1 text-[11px] leading-relaxed">
                    {currentItem.matchReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Editable Title (소제목) */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              소제목 (클릭하여 직접 수정 가능)
            </label>
            <input
              type="text"
              value={currentItem.title}
              onChange={(e) => updateItemField(currentIdx, "title", e.target.value)}
              placeholder="[임팩트 있는 소제목을 입력하세요]"
              className="w-full text-base sm:text-lg font-bold text-blue-950 bg-amber-50/40 border border-amber-200/80 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Editable Body Content */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                문항 {currentIdx + 1} 자기소개서 본문
              </label>
              <span className="text-xs text-gray-400">
                본문을 수정하면 글자 수가 실시간으로 갱신됩니다
              </span>
            </div>
            <textarea
              value={currentItem.content}
              onChange={(e) => updateItemField(currentIdx, "content", e.target.value)}
              rows={13}
              className="w-full p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-gray-800 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition shadow-inner font-sans resize-y"
              placeholder="자기소개서 본문..."
            />
          </div>

          {/* Character Counter & Gauge Bar */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-gray-500">공백 포함:</span>{" "}
                  <strong
                    className={`text-sm ${
                      isWithinTolerance ? "text-emerald-600" : "text-amber-700"
                    }`}
                  >
                    {charCountWithSpaces.toLocaleString()}자
                  </strong>
                  <span className="text-gray-400 text-[11px] ml-1">
                    / 목표 {targetLength}자 ({percentOfTarget}%)
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-gray-500">공백 제외:</span>{" "}
                  <strong className="text-gray-700 text-sm">
                    {charCountNoSpaces.toLocaleString()}자
                  </strong>
                </div>
              </div>

              <div>
                {isWithinTolerance ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    목표 글자 수 최적 달성 (±10% 이내)
                  </span>
                ) : charCountWithSpaces < targetLength * 0.9 ? (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                    약 {Math.round(targetLength * 0.9 - charCountWithSpaces)}자 부족
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full">
                    약 {Math.round(charCountWithSpaces - targetLength * 1.1)}자 초과
                  </span>
                )}
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 bg-emerald-100/60 z-0"
                style={{ left: "90%", width: "20%" }}
                title="±10% 권장 범위"
              />
              <div
                className={`h-full rounded-full transition-all duration-300 relative z-10 ${
                  isWithinTolerance
                    ? "bg-emerald-500"
                    : percentOfTarget > 110
                    ? "bg-orange-500"
                    : "bg-amber-400"
                }`}
                style={{ width: `${Math.min(percentOfTarget, 100)}%` }}
              />
            </div>
          </div>

          {/* AI Key Highlights and Feedback */}
          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItem.keyHighlights && currentItem.keyHighlights.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                  🎯 문항 {currentIdx + 1} 핵심 역량 포인트
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentItem.keyHighlights.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold bg-white text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg shadow-2xs"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentItem.feedback && (
              <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200/60">
                <span className="text-[11px] font-bold text-sky-900 block mb-1">
                  💡 문항 {currentIdx + 1} 합격 조언
                </span>
                <p className="text-xs text-sky-800 leading-relaxed">
                  {currentItem.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Smart Rewriting Toolbar (Applies to currently active question) */}
      {activeTab !== "all" && (
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-gray-900">
                문항 {currentIdx + 1} AI 원클릭 재작성 도구
              </h3>
            </div>
            {isRewriting && (
              <span className="text-xs text-amber-600 font-bold animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                문항 {currentIdx + 1} 다듬는 중...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => handleRewrite("shorten")}
              disabled={isRewriting}
              className="flex flex-col items-center justify-center p-3 text-center bg-gray-50 hover:bg-amber-50 hover:border-amber-300 border border-gray-200 rounded-2xl transition disabled:opacity-50 text-xs font-bold text-gray-700"
            >
              <Scissors className="w-4 h-4 text-orange-500 mb-1" />
              <span>글자 수 줄이기</span>
              <span className="text-[10px] text-gray-400 font-normal">
                핵심만 압축 (-15%)
              </span>
            </button>

            <button
              onClick={() => handleRewrite("expand")}
              disabled={isRewriting}
              className="flex flex-col items-center justify-center p-3 text-center bg-gray-50 hover:bg-amber-50 hover:border-amber-300 border border-gray-200 rounded-2xl transition disabled:opacity-50 text-xs font-bold text-gray-700"
            >
              <Maximize2 className="w-4 h-4 text-blue-500 mb-1" />
              <span>내용 더 늘리기</span>
              <span className="text-[10px] text-gray-400 font-normal">
                행동/배움 보강 (+15%)
              </span>
            </button>

            <button
              onClick={() => handleRewrite("more_professional")}
              disabled={isRewriting}
              className="flex flex-col items-center justify-center p-3 text-center bg-gray-50 hover:bg-amber-50 hover:border-amber-300 border border-gray-200 rounded-2xl transition disabled:opacity-50 text-xs font-bold text-gray-700"
            >
              <Briefcase className="w-4 h-4 text-emerald-600 mb-1" />
              <span>비즈니스 격식체</span>
              <span className="text-[10px] text-gray-400 font-normal">
                정제된 전문 어조
              </span>
            </button>

            <button
              onClick={() => handleRewrite("new_subheadings")}
              disabled={isRewriting}
              className="flex flex-col items-center justify-center p-3 text-center bg-gray-50 hover:bg-amber-50 hover:border-amber-300 border border-gray-200 rounded-2xl transition disabled:opacity-50 text-xs font-bold text-gray-700"
            >
              <RefreshCw className="w-4 h-4 text-purple-500 mb-1" />
              <span>소제목 새로 뽑기</span>
              <span className="text-[10px] text-gray-400 font-normal">
                헤드라인 3종 추천
              </span>
            </button>

            <button
              onClick={() => setShowCustomPromptModal(true)}
              disabled={isRewriting}
              className="flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 rounded-2xl transition disabled:opacity-50 text-xs font-bold text-amber-900 col-span-2 sm:col-span-1"
            >
              <MessageSquare className="w-4 h-4 text-amber-600 mb-1" />
              <span>맞춤 요청 재작성</span>
              <span className="text-[10px] text-amber-700 font-normal">
                원하는 부분 직접 지시
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Export Section (Docx, PDF, Copy) */}
      <div className="p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 rounded-3xl border-2 border-amber-300 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FileCheck className="w-5 h-5 text-amber-700" />
              <h4 className="text-base font-black text-gray-900">
                총 {items.length}개 전체 문항 서류 패키지 다운로드
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              전체 {items.length}개 문항이 번호순으로 완벽히 정돈된 하나의 공식 Word(.docx) 또는 PDF 파일로 즉시 내려받으세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadDocx}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Word (.docx) 전체 다운로드
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              PDF 전체 인쇄 / 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Custom Prompt Modal */}
      {showCustomPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-amber-200">
            <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              문항 {currentIdx + 1} 맞춤형 AI 재작성 지시
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              문항 {currentIdx + 1}에 대해 수정하고 싶은 방향을 구체적으로 입력해주세요.
            </p>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="예: '성과 수치를 더 명확히 드러내줘', '협업 과정에서 소통 방식을 더 구체적으로 적어줘'..."
              className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomPromptModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                취소
              </button>
              <button
                onClick={() => handleRewrite("custom", customPrompt)}
                disabled={!customPrompt.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow disabled:opacity-50"
              >
                재작성 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
