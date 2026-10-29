"use client";

import React, { useState } from "react";
import {
  Building2,
  Briefcase,
  Upload,
  Check,
  Loader2,
  Sparkles,
  Target,
  Info,
} from "lucide-react";

interface StepOneJobProps {
  company: string;
  setCompany: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  companyInfo: string;
  setCompanyInfo: (val: string) => void;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  selectedKeywords: string[];
  setSelectedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}

export function StepOneJob({
  company,
  setCompany,
  role,
  setRole,
  companyInfo,
  setCompanyInfo,
  jobDescription,
  setJobDescription,
  selectedKeywords,
  setSelectedKeywords,
}: StepOneJobProps) {
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // File upload handler (text, pdf or image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    if (file.type.startsWith("image/")) {
      // Image upload -> encode base64 and analyze with Gemini
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await analyzeJobWithGemini({ imageBase64: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text or standard file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        setJobDescription(text);
        await analyzeJobWithGemini({ text });
      };
      reader.readAsText(file);
    }
  };

  // Trigger Gemini analysis of job posting
  const analyzeJobWithGemini = async (payload: {
    text?: string;
    imageBase64?: string;
    mimeType?: string;
  }) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("공고 분석에 실패했습니다.");
      }

      const data = await res.json();
      if (data.companyName && !company) {
        setCompany(data.companyName);
      }
      if (data.roleName && !role) {
        setRole(data.roleName);
      }
      if (data.talentProfile && !companyInfo) {
        setCompanyInfo(data.talentProfile);
      }
      if (data.summary && !jobDescription) {
        setJobDescription(data.summary);
      }
      if (data.recommendedKeywords && Array.isArray(data.recommendedKeywords)) {
        setExtractedKeywords(data.recommendedKeywords);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== kw));
    } else {
      setSelectedKeywords([...selectedKeywords, kw]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
        <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
          1
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            지원 정보 & 채용 공고
          </h2>
          <p className="text-xs text-gray-500">
            목표 기업과 지원 직무, 그리고 채용공고의 핵심 요강을 입력해주세요.
          </p>
        </div>
      </div>

      {/* Company & Role Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            지원 기업명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="예: 네이버, 토스, 카카오, 현대자동차, 쿠팡, 스타트업..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            지원 직무 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="예: 프론트엔드 개발자, 서비스 기획자, 마케팅 매니저, 데이터 분석가..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
      </div>

      {/* Company Talent Profile & Core Values (선택 입력) */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-600" />
            기업 인재상 &amp; 핵심가치 / 기업 정보 (선택 입력)
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-850 bg-amber-200/70 text-amber-900 px-2.5 py-0.5 rounded-full shadow-2xs">
            💡 지원동기 &amp; 회사 선택 명분 집중 연계
          </span>
        </div>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          지원 기업이 추구하는 인재상(예: 고객 집착, 자율과 책임 등)이나 핵심 비전/비즈니스 방향을 적어주세요. AI가 <strong>&apos;수많은 회사 중 왜 이 기업을 선택했는가?&apos;</strong>에 대한 구체적인 명분과 지원자의 가치관 일치점을 지원동기 문항에 설득력 있게 서술합니다.
        </p>
        <textarea
          rows={2}
          value={companyInfo}
          onChange={(e) => setCompanyInfo(e.target.value)}
          placeholder="예: 고객 중심적 사고, 자율과 책임, 데이터 기반의 빠른 실행력, 지속가능한 글로벌 물류 생태계 구축 등... (직접 적거나 아래 추천 태그 클릭)"
          className="w-full p-3 text-xs text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
        />

        {/* Quick Tag Pills to append to companyInfo */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-gray-500 font-semibold mr-1">빠른 추천 태그:</span>
          {[
            "고객 집착 및 고객 중심",
            "데이터 기반 의사결정",
            "빠른 실행과 실험 정신",
            "원팀(One Team) 상호 신뢰",
            "주도적 오너십(주인의식)",
            "기술 혁신과 몰입",
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const trimmed = companyInfo.trim();
                if (!trimmed) {
                  setCompanyInfo(tag);
                } else if (!trimmed.includes(tag)) {
                  setCompanyInfo(`${trimmed}, ${tag}`);
                }
              }}
              className="text-[10px] font-medium px-2 py-0.5 bg-white text-gray-700 hover:text-amber-900 hover:bg-amber-100/70 border border-gray-200/90 rounded-lg transition"
            >
              +{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Job Description (Tabs: Text or File) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            채용공고 본문 또는 파일 업로드 (선택 입력)
          </label>

          <div className="flex bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === "text"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              텍스트 직접 입력
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === "file"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              파일/이미지 업로드
            </button>
          </div>
        </div>

        {/* Guidance Notice regarding Company Info / Talent profile inside Job Description */}
        <div className="p-3 bg-blue-50/80 border border-blue-150 rounded-xl flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>안내:</strong> 공고 본문란에 기업 정보나 인재상, 비전을 함께 적거나 업로드하셔도 AI가 이를 자동으로 파악하여 자기소개서 지원동기 문항에 풍부하게 반영합니다.
          </div>
        </div>

        {activeTab === "text" ? (
          <div>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="채용공고의 주요 업무, 자격요건, 우대사항 및 기업 비전을 복사하여 붙여넣으시면 AI가 공고의 핵심 인재상과 어휘를 모든 자소서 문항에 자연스럽게 녹여냅니다."
              className="w-full p-3.5 text-xs text-gray-700 placeholder:text-gray-400 placeholder:font-normal bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
            {jobDescription.trim().length > 20 && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => analyzeJobWithGemini({ text: jobDescription })}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  AI로 공고 핵심 키워드 뽑아내기
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-2xl text-center bg-gray-50/50 transition">
            <input
              type="file"
              id="job-file-input"
              accept=".txt,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="job-file-input"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-xs font-bold text-gray-800">
                {uploadedFileName || "채용공고 파일 (TXT, PDF, 공고 캡처 이미지) 업로드"}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                파일을 올리시면 AI가 텍스트를 자동 판독하여 기업명과 직무 요강을 분석합니다.
              </p>
            </label>
            {isAnalyzing && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-amber-700">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>공고 이미지를 정밀 분석하는 중입니다...</span>
              </div>
            )}
          </div>
        )}

        {/* Extracted Keywords Suggestions */}
        {extractedKeywords.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-900 block mb-2">
              ✨ 공고 분석으로 발견된 추천 직무 키워드 (클릭하여 자소서에 반영):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {extractedKeywords.map((kw, i) => {
                const isSelected = selectedKeywords.includes(kw);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                      isSelected
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    #{kw}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
