"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bookmark,
  BookmarkPlus,
  Plus,
  Trash2,
  Check,
  Wand2,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight,
  FileUp,
} from "lucide-react";
import { StarExperience } from "@/lib/types";
import { SAMPLE_SINGLE_PRESET, SAMPLE_STAR_PRESETS } from "@/lib/sample-data";

interface StepThreeExperiencePoolProps {
  experiences: StarExperience[];
  setExperiences: React.Dispatch<React.SetStateAction<StarExperience[]>>;
  onOpenVault: () => void;
  onSaveToVault: (exp: StarExperience) => void;
}

export function StepThreeExperiencePool({
  experiences,
  setExperiences,
  onOpenVault,
  onSaveToVault,
}: StepThreeExperiencePoolProps) {
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // File / Document Batch Extraction States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [lastExtractSummary, setLastExtractSummary] = useState<string | null>(null);
  const [pastedDocText, setPastedDocText] = useState("");
  const [appendMode, setAppendMode] = useState<"replace" | "append">("replace");

  const activeExp = experiences[activeExpIndex] || experiences[0];

  const updateActiveExp = (field: keyof StarExperience, val: any) => {
    setExperiences((prev) =>
      prev.map((e, idx) => (idx === activeExpIndex ? { ...e, [field]: val } : e))
    );
  };

  const handleAddExperience = () => {
    const newIdx = experiences.length + 1;
    const newExp: StarExperience = {
      id: `exp-${Date.now()}`,
      title: "",
      category: "직무 프로젝트",
      createdAt: new Date().toISOString().split("T")[0],
      situation: "",
      task: "",
      action: "",
      result: "",
    };
    setExperiences([...experiences, newExp]);
    setActiveExpIndex(experiences.length);
  };

  const handleRemoveExperience = (idx: number) => {
    if (experiences.length <= 1) {
      alert("최소 1개 이상의 경험이 필요합니다.");
      return;
    }
    const filtered = experiences.filter((_, i) => i !== idx);
    setExperiences(filtered);
    if (activeExpIndex >= filtered.length) {
      setActiveExpIndex(filtered.length - 1);
    }
  };

  const handleFillSample = () => {
    setExperiences((prev) =>
      prev.map((e, idx) =>
        idx === activeExpIndex
          ? {
              ...e,
              title: SAMPLE_SINGLE_PRESET.title,
              situation: SAMPLE_SINGLE_PRESET.situation,
              task: SAMPLE_SINGLE_PRESET.task,
              action: SAMPLE_SINGLE_PRESET.action,
              result: SAMPLE_SINGLE_PRESET.result,
              category: SAMPLE_SINGLE_PRESET.category,
            }
          : e
      )
    );
  };

  const handleClearActiveExp = () => {
    setExperiences((prev) =>
      prev.map((e, idx) =>
        idx === activeExpIndex
          ? {
              ...e,
              title: "",
              situation: "",
              task: "",
              action: "",
              result: "",
            }
          : e
      )
    );
  };

  const handleSaveActiveToVault = () => {
    if (!activeExp) return;
    onSaveToVault(activeExp);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
  };

  // API Call: Batch extract multiple STAR experiences from File/Image/Text
  const extractExperiencesWithGemini = async (payload: {
    text?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/extract-experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "경험 분석 및 추출에 실패했습니다.");
      }

      const data = await res.json();
      const extractedList: StarExperience[] = (data.experiences || []).map(
        (item: any, i: number) => ({
          id: `extracted-${Date.now()}-${i}`,
          title: item.title || `추출된 경험 ${i + 1}`,
          category: item.category || "직무 프로젝트",
          createdAt: new Date().toISOString().split("T")[0],
          situation: item.situation || "",
          task: item.task || "",
          action: item.action || "",
          result: item.result || "",
          keywords: item.keywords || [],
        })
      );

      if (extractedList.length === 0) {
        throw new Error("파일에서 유효한 STAR 경험을 식별하지 못했습니다.");
      }

      setLastExtractSummary(data.analysisSummary || null);

      if (appendMode === "append") {
        // Filter out empty placeholder if it's the only one
        const currentValid = experiences.filter(
          (e) => e.title.trim() || e.action.trim() || e.situation.trim()
        );
        setExperiences([...currentValid, ...extractedList]);
        setActiveExpIndex(currentValid.length);
      } else {
        // Replace current experiences
        setExperiences(extractedList);
        setActiveExpIndex(0);
      }
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || "경험 추출 중 오류가 발생했습니다.");
    } finally {
      setIsExtracting(false);
    }
  };

  // File Upload Handler (PDF, Image, TXT, MD)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsExtracting(true);
    setExtractError(null);

    try {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64 = event.target?.result as string;
            await extractExperiencesWithGemini({
              fileBase64: base64,
              mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/png"),
              fileName: file.name,
            });
          } catch (err: any) {
            setExtractError(err.message || "파일 분석 중 오류가 발생했습니다.");
            setIsExtracting(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Text / Markdown
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const text = event.target?.result as string;
            await extractExperiencesWithGemini({
              text,
              fileName: file.name,
            });
          } catch (err: any) {
            setExtractError(err.message || "문서 분석 중 오류가 발생했습니다.");
            setIsExtracting(false);
          }
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      setExtractError(err.message || "파일을 읽는 도중 오류가 발생했습니다.");
      setIsExtracting(false);
    }
  };

  const handlePasteExtract = async () => {
    if (!pastedDocText.trim()) {
      alert("분석할 경험 정리 텍스트를 입력해주세요.");
      return;
    }
    await extractExperiencesWithGemini({
      text: pastedDocText,
      fileName: "붙여넣은 텍스트 메모",
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
            3
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                나의 STAR 경험 풀 (AI 매칭용 무기 창고)
              </h2>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                AI 자동 선별 &amp; 매칭
              </span>
            </div>
            <p className="text-xs text-gray-500">
              보유한 경험들을 등록해 두시면, <strong>AI가 질문 의도를 분석해 가장 적합한 경험을 스스로 골라</strong> 작성합니다.
            </p>
          </div>
        </div>

        {/* Input Mode Tabs: Text vs File/Image */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                inputMode === "text"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              텍스트 직접 입력
            </button>
            <button
              type="button"
              onClick={() => setInputMode("file")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                inputMode === "file"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <FileUp className="w-3.5 h-3.5 text-blue-600" />
              파일/이미지 업로드
              <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-black">
                다중 추출
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenVault}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-gray-600" />
            내 보관함
          </button>
        </div>
      </div>

      {/* AI Smart Match Explanation Callout Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border border-amber-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold shadow-2xs mt-0.5">
          💡
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-950">
            문항마다 어떤 경험을 쓸지 일일이 배정하지 않으셔도 됩니다!
          </h4>
          <p className="text-gray-700 leading-relaxed">
            지원자님이 겪으신 소중한 STAR 경험들을 편하게 적거나 파일로 올려두시면, <strong>AI가 Step 2의 모든 질문 항목(지원동기, 문제해결, 협업, 입사후포부 등)을 정밀 분석하여 각 질문에 가장 알맞은 경험을 스마트하게 매칭</strong>하여 중복 없이 다채로운 자기소개서로 작성해 드립니다.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FILE / IMAGE / DOCUMENT BATCH EXTRACTION */}
      {/* ========================================================================= */}
      {inputMode === "file" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Extraction Mode Switch: Replace vs Append */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <span className="text-gray-600 font-medium">
              📄 파일 안에 여러 개의 경험(프로젝트, 인턴, 공모전 등)이 한꺼번에 적혀 있어도 AI가 개별 STAR 경험으로 분리하여 등록합니다.
            </span>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-gray-500 text-[11px]">등록 방식:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="appendMode"
                  checked={appendMode === "replace"}
                  onChange={() => setAppendMode("replace")}
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span className="text-gray-700">새로 교체하기</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer ml-1">
                <input
                  type="radio"
                  name="appendMode"
                  checked={appendMode === "append"}
                  onChange={() => setAppendMode("append")}
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span className="text-gray-700">기존 목록에 추가하기</span>
              </label>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="p-8 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-3xl text-center bg-amber-50/20 hover:bg-amber-50/40 transition">
            <input
              type="file"
              id="experience-file-input"
              accept=".txt,.md,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={isExtracting}
              className="hidden"
            />
            <label
              htmlFor="experience-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                {isExtracting ? (
                  <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
                ) : (
                  <Upload className="w-7 h-7 text-amber-600" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900">
                  {uploadedFileName
                    ? `선택된 파일: ${uploadedFileName}`
                    : "경험 정리 파일 (PDF, TXT, MD, 이력서/포트폴리오 캡처 이미지) 업로드"}
                </p>
                <p className="text-xs text-gray-500 max-w-lg mx-auto">
                  클릭하거나 파일을 드래그하여 올려주세요. 지원자님의 경험 노트에서 AI가 각 프로젝트별 Situation, Task, Action, Result를 정밀 분리해 냅니다.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition shadow-2xs">
                <FileUp className="w-3.5 h-3.5" />
                파일 선택하기
              </span>
            </label>
          </div>

          {/* Loading Animation Status */}
          {isExtracting && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center gap-3.5 text-amber-900 animate-pulse">
              <span className="text-2xl">🐹⭐</span>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">
                  별기니와 AI가 문서 내 다양한 경험들을 감지하여 각각의 STAR 구조로 분리하고 있습니다...
                </p>
                <p className="text-[11px] text-amber-700">
                  프로젝트 배경, 직면했던 과제, 주도적 행동, 성과 수치를 분석 중입니다. 잠시만 기다려주세요!
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {extractError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
              <span>⚠️ {extractError}</span>
              <button
                type="button"
                onClick={() => setExtractError(null)}
                className="font-bold underline ml-2"
              >
                닫기
              </button>
            </div>
          )}

          {/* Alternative: Paste Text Directly */}
          <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                또는 노션/메모장에 적어둔 경험 텍스트 일괄 붙여넣기
              </label>
              <span className="text-[11px] text-gray-400">
                {pastedDocText.length}자 입력됨
              </span>
            </div>
            <textarea
              rows={4}
              value={pastedDocText}
              onChange={(e) => setPastedDocText(e.target.value)}
              placeholder="예: 
1. 대용량 트래픽 최적화: 동아리 해커톤 당시 동시접속 1200명 몰려 4초 지연 -> Redis 캐싱과 복합 인덱스 적용 -> 응답속도 0.38초로 단축 및 최우수상
2. 마케팅 CVR 개선: 랜딩페이지 이탈률 68% -> Hotjar 분석 후 A/B 테스트 진행 -> 전환율 1.4%에서 3.4%로 2.4배 향상

여러 개의 경험을 편하게 복사해 붙여넣으시면 AI가 각 경험을 자동 분리해 등록합니다."
              className="w-full p-3.5 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePasteExtract}
                disabled={isExtracting || !pastedDocText.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 px-4 py-2 rounded-xl transition shadow-xs"
              >
                {isExtracting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                붙여넣은 내용에서 다중 STAR 경험 자동 분리 추출
              </button>
            </div>
          </div>

          {/* Success Banner & Extracted Experiences Preview */}
          {experiences.some((e) => e.title.trim() || e.action.trim()) && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      현재 경험 풀에 총 {experiences.length}개의 STAR 경험이 등록되어 있습니다!
                    </h4>
                    {lastExtractSummary && (
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        {lastExtractSummary}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode("text");
                    setActiveExpIndex(0);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl transition shadow-2xs"
                >
                  <span>텍스트 직접 입력 탭에서 내용 확인 &amp; 편집</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    onClick={() => {
                      setActiveExpIndex(idx);
                      setInputMode("text");
                    }}
                    className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-amber-400 hover:shadow-xs transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center">
                          E{idx + 1}
                        </span>
                        <h5 className="font-bold text-xs text-gray-900 group-hover:text-amber-700 transition truncate max-w-[200px]">
                          {exp.title || `경험 ${idx + 1}`}
                        </h5>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400">
                        {exp.category || "직무 프로젝트"}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 line-clamp-2">
                      <strong className="text-amber-700">Action:</strong> {exp.action || exp.situation || "작성된 내용이 없습니다."}
                    </p>

                    {exp.keywords && exp.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.keywords.slice(0, 3).map((kw, ki) => (
                          <span
                            key={ki}
                            className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DIRECT TEXT EDITING (STAR TABS & FIELDS) */}
      {/* ========================================================================= */}
      {inputMode === "text" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Experience Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {experiences.map((exp, idx) => {
              const isActive = idx === activeExpIndex;
              const displayTitle = exp.title.trim() || `경험 ${idx + 1}`;

              return (
                <button
                  key={exp.id || idx}
                  type="button"
                  onClick={() => setActiveExpIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
                    isActive
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-200"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                      isActive ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[130px]">{displayTitle}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddExperience}
              className="flex items-center gap-1 px-3 py-2.5 rounded-2xl text-xs font-bold text-amber-800 bg-amber-100/60 hover:bg-amber-100 border border-dashed border-amber-300 transition whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              새 경험 추가
            </button>
          </div>

          {/* Active Experience Editor Box */}
          {activeExp && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-50/30 via-white to-white border border-amber-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">
                    E{activeExpIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={activeExp.title}
                    onChange={(e) => updateActiveExp("title", e.target.value)}
                    placeholder="예: 대용량 트래픽 최적화 프로젝트 (경험 제목)"
                    className="font-bold text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-transparent border-b border-dashed border-gray-300 focus:border-amber-500 focus:outline-none px-1 py-0.5 w-full max-w-md transition"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition"
                    title="실무 추천 예시 샘플 1개 채우기"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>예시 채우기</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearActiveExp}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 px-2.5 py-1.5 rounded-lg transition"
                    title="입력한 내용 지우고 가이드 예시 보기"
                  >
                    <span>내용 비우기</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveActiveToVault}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition"
                    title="이 경험을 보관함에 저장"
                  >
                    <BookmarkPlus className="w-3 h-3 text-blue-600" />
                    {saveSuccessMsg ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> 저장됨
                      </span>
                    ) : (
                      <span>보관함에 저장</span>
                    )}
                  </button>

                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(activeExpIndex)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="이 경험 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 4 STAR Fields with gray placeholders like the reference image */}
              <div className="space-y-3.5">
                {/* Situation */}
                <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-500 text-white font-black text-[10px] flex items-center justify-center">
                        S
                      </span>
                      <label className="text-xs font-bold text-gray-800">
                        Situation (상황 및 배경)
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {(activeExp.situation || "").length}자
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={activeExp.situation || ""}
                    onChange={(e) => updateActiveExp("situation", e.target.value)}
                    placeholder="예: 프로젝트 진행 당시 마감 1주일을 앞두고 동시 접속자가 몰리며 서버 응답이 4초 이상 지연되는 문제가 발생했습니다."
                    className="w-full p-2.5 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>

                {/* Task */}
                <div className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-orange-500 text-white font-black text-[10px] flex items-center justify-center">
                        T
                      </span>
                      <label className="text-xs font-bold text-gray-800">
                        Task (과제 / 직면 난관)
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {(activeExp.task || "").length}자
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={activeExp.task || ""}
                    onChange={(e) => updateActiveExp("task", e.target.value)}
                    placeholder="예: 서버 증설 예산 없이 핵심 트랜잭션의 p99 응답시간을 1초 이내로 단축하여 서비스 무중단 안정성을 확보해야 했습니다."
                    className="w-full p-2.5 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  />
                </div>

                {/* Action */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border-2 border-amber-300 relative">
                  <div className="absolute top-2.5 right-3 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                    ★ 핵심 행동
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                        A
                      </span>
                      <label className="text-xs font-black text-gray-900">
                        Action (내가 주도적으로 취한 구체적 행동) <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-400 mr-16">
                      {(activeExp.action || "").length}자
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={activeExp.action || ""}
                    onChange={(e) => updateActiveExp("action", e.target.value)}
                    placeholder="예: APM으로 병목 쿼리를 찾아 Redis 캐시 레이어를 도입하고 복합 인덱스를 적용해 DB 부하 70%를 해소했습니다."
                    className="w-full p-2.5 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </div>

                {/* Result */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                        R
                      </span>
                      <label className="text-xs font-bold text-gray-800">
                        Result (성과 및 배운 점)
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {(activeExp.result || "").length}자
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={activeExp.result || ""}
                    onChange={(e) => updateActiveExp("result", e.target.value)}
                    placeholder="예: 평균 응답속도를 4.2초에서 0.38초로 91% 단축시켰고, 오류율 0%를 기록하며 최우수 프로젝트상을 수상했습니다."
                    className="w-full p-2.5 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer helper */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>
              현재 <strong>총 {experiences.length}개의 경험</strong>이 풀에 등록되어 있습니다.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFillSample}
                className="text-amber-700 hover:text-amber-900 font-bold hover:underline"
              >
                ⭐ 실무 추천 예시 1개 채우기
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearActiveExp}
                className="text-gray-500 hover:text-gray-800 hover:underline"
              >
                내용 비우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
