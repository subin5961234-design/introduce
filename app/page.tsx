"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StarCraftMascot } from "@/components/StarCraftMascot";
import { StepOneJob } from "@/components/StepOneJob";
import { StepTwoQuestions } from "@/components/StepTwoQuestions";
import { StepThreeExperiencePool } from "@/components/StepThreeExperiencePool";
import { StepThreeOptions } from "@/components/StepThreeOptions";
import { LoadingModal } from "@/components/LoadingModal";
import { ResultEditor } from "@/components/ResultEditor";
import { StarGuideModal } from "@/components/StarGuideModal";
import { ExperienceVaultModal } from "@/components/ExperienceVaultModal";
import {
  StarExperience,
  GenerationResponse,
  GenerationRequest,
  QuestionDefinition,
  BatchGenerationRequest,
} from "@/lib/types";
import {
  DEFAULT_INITIAL_EXPERIENCE,
  SAMPLE_SINGLE_PRESET,
  SAMPLE_STAR_PRESETS,
  DEFAULT_INITIAL_QUESTIONS,
} from "@/lib/sample-data";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, HeartHandshake, Wand2 } from "lucide-react";

const AUTOSAVE_STORAGE_KEY = "star_craft_form_autosave_v4";
const VAULT_STORAGE_KEY = "star_craft_saved_experiences_v1";

interface SavedFormState {
  company?: string;
  role?: string;
  companyInfo?: string;
  jobDescription?: string;
  questions?: QuestionDefinition[];
  experiences?: StarExperience[];
  targetLength?: number;
  tone?: GenerationRequest["tone"];
  subheadingStyle?: GenerationRequest["subheadingStyle"];
  selectedKeywords?: string[];
  lastSavedAt?: string;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Form States (Consistent defaults for SSR and initial client hydration)
  const [company, setCompany] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [companyInfo, setCompanyInfo] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionDefinition[]>(DEFAULT_INITIAL_QUESTIONS);
  const [experiences, setExperiences] = useState<StarExperience[]>([DEFAULT_INITIAL_EXPERIENCE]);
  const [targetLength, setTargetLength] = useState<number>(700);
  const [tone, setTone] = useState<GenerationRequest["tone"]>("professional");
  const [subheadingStyle, setSubheadingStyle] =
    useState<GenerationRequest["subheadingStyle"]>("impact_number");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Generation & Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResponse | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Modals
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Saved Vault Experiences
  const [savedExperiences, setSavedExperiences] = useState<StarExperience[]>([SAMPLE_SINGLE_PRESET]);

  // Restore autosave and vault on client mount only to prevent hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
        if (raw) {
          const parsed: SavedFormState = JSON.parse(raw);
          if (parsed.company !== undefined) setCompany(parsed.company);
          if (parsed.role !== undefined) setRole(parsed.role);
          if (parsed.companyInfo !== undefined) setCompanyInfo(parsed.companyInfo);
          if (parsed.jobDescription !== undefined) setJobDescription(parsed.jobDescription);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            setQuestions(parsed.questions);
          }
          if (Array.isArray(parsed.experiences) && parsed.experiences.length > 0) {
            setExperiences(parsed.experiences);
          }
          if (parsed.targetLength) setTargetLength(parsed.targetLength);
          if (parsed.tone) setTone(parsed.tone);
          if (parsed.subheadingStyle) setSubheadingStyle(parsed.subheadingStyle);
          if (Array.isArray(parsed.selectedKeywords)) setSelectedKeywords(parsed.selectedKeywords);
          if (parsed.lastSavedAt) setLastSavedAt(parsed.lastSavedAt);
        }

        const rawVault = localStorage.getItem(VAULT_STORAGE_KEY);
        if (rawVault) {
          const parsedVault = JSON.parse(rawVault);
          if (Array.isArray(parsedVault) && parsedVault.length > 0) {
            setSavedExperiences(parsedVault);
          }
        }
      } catch (e) {
        console.error("Failed to restore saved data:", e);
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Autosave when inputs change (debounced, only after initial hydration load)
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      try {
        const now = new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const payload: SavedFormState = {
          company,
          role,
          companyInfo,
          jobDescription,
          questions,
          experiences,
          targetLength,
          tone,
          subheadingStyle,
          selectedKeywords,
          lastSavedAt: now,
        };
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
        setLastSavedAt(now);
      } catch (err) {
        console.error("Autosave error:", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isLoaded,
    company,
    role,
    companyInfo,
    jobDescription,
    questions,
    experiences,
    targetLength,
    tone,
    subheadingStyle,
    selectedKeywords,
  ]);

  // Reset form to blank
  const handleResetForm = () => {
    setCompany("");
    setRole("");
    setCompanyInfo("");
    setJobDescription("");
    setQuestions(DEFAULT_INITIAL_QUESTIONS);
    setExperiences([DEFAULT_INITIAL_EXPERIENCE]);
    setSelectedKeywords([]);
    setGenerationResult(null);
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    setLastSavedAt(null);
  };

  // Vault helpers
  const handleSelectExperienceFromVault = (exp: StarExperience) => {
    // Add selected experience from vault to current pool
    if (!experiences.some((e) => e.id === exp.id)) {
      setExperiences([exp, ...experiences]);
    }
  };

  const handleSaveExperience = (exp: StarExperience) => {
    const updated = [exp, ...savedExperiences.filter((item) => item.id !== exp.id)];
    setSavedExperiences(updated);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDeleteExperience = (id: string) => {
    const updated = savedExperiences.filter((item) => item.id !== id);
    setSavedExperiences(updated);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImportExperiences = (items: StarExperience[]) => {
    const merged = [...items, ...savedExperiences];
    const unique = Array.from(new Map(merged.map((m) => [m.id, m])).values());
    setSavedExperiences(unique);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(unique));
  };

  // Submit & Generate AI Self-introduction with Smart Experience Matching
  const handleGenerate = async () => {
    if (!company.trim()) {
      alert("지원 기업명을 입력해주세요.");
      return;
    }
    if (!role.trim()) {
      alert("지원 직무를 입력해주세요.");
      return;
    }
    if (questions.length === 0) {
      alert("최소 1개 이상의 자기소개서 문항이 필요합니다.");
      return;
    }
    const hasAnyExperienceContent = experiences.some(
      (e) =>
        e.action?.trim() ||
        e.situation?.trim() ||
        e.task?.trim() ||
        e.result?.trim() ||
        e.title?.trim()
    );
    if (!hasAnyExperienceContent) {
      alert(
        "경험 풀(Step 3)에 최소 1개 이상의 경험을 작성해주세요. 빠른 테스트를 원하시면 [⭐ 실무 추천 예시 1개 채우기] 버튼을 누르시면 됩니다!"
      );
      return;
    }

    setIsGenerating(true);
    try {
      const payload: BatchGenerationRequest = {
        company,
        role,
        companyInfo,
        jobDescription,
        tone,
        subheadingStyle,
        keywords: selectedKeywords,
        questions,
        experiences,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "자기소개서 생성에 실패했습니다.");
      }

      const data: GenerationResponse = await res.json();
      setGenerationResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message || "생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <Header
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleResetForm}
        vaultCount={savedExperiences.length}
        lastSavedAt={lastSavedAt}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* If we have a generation result, show the Result Editor */}
        {generationResult ? (
          <ResultEditor
            company={company}
            role={role}
            initialResult={generationResult}
            onBackToForm={() => setGenerationResult(null)}
            onSaveToVault={(title) => {
              if (experiences[0]) {
                handleSaveExperience({ ...experiences[0], title });
              }
            }}
          />
        ) : (
          /* Main Input Workflow */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 border-2 border-amber-300 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 text-center md:text-left max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-bold shadow-2xs">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
                    취준생 힐링 서류 작성 파트너
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                    경험만 적어두세요! <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                      문항별 최적 경험을 AI가 자동 선별
                    </span>하여 완성
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    문항마다 어떤 경험을 써야 할지 고민할 필요 없습니다. 내가 가진 STAR 경험 풀을 등록해 두시면, <strong>AI가 문항의 질문 의도(지원동기, 문제해결, 협업 등)에 가장 완벽히 부합하는 경험을 스스로 매칭</strong>하여 정갈한 자소서와 Word/PDF로 일괄 제작합니다.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-gray-600">
                    <span className="flex items-center gap-1">
                      <Wand2 className="w-4 h-4 text-blue-600" />
                      문항별 최적 STAR 경험 자동 선별
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      과장/허위 방지 팩트 기반
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      최소 4개 이상 문항 일괄 생성 &amp; 통합 다운로드
                    </span>
                  </div>
                </div>

                {/* Mascot Visual */}
                <div className="shrink-0 flex flex-col items-center">
                  <StarCraftMascot mood="cheering" size={130} />
                  <span className="text-[11px] font-bold text-amber-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs mt-1">
                    마스코트 별기니 🐹⭐
                  </span>
                </div>
              </div>
            </section>

            {/* Step 1: Company & Job Description */}
            <StepOneJob
              company={company}
              setCompany={setCompany}
              role={role}
              setRole={setRole}
              companyInfo={companyInfo}
              setCompanyInfo={setCompanyInfo}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              selectedKeywords={selectedKeywords}
              setSelectedKeywords={setSelectedKeywords}
            />

            {/* Step 2: Cover Letter Questions List (Default 4 questions) */}
            <StepTwoQuestions
              questions={questions}
              setQuestions={setQuestions}
            />

            {/* Step 3: Candidate's STAR Experience Pool (AI Auto-Matches from this pool) */}
            <StepThreeExperiencePool
              experiences={experiences}
              setExperiences={setExperiences}
              onOpenVault={() => setIsVaultOpen(true)}
              onSaveToVault={handleSaveExperience}
            />

            {/* Step 4: Target Length & Options */}
            <StepThreeOptions
              targetLength={targetLength}
              setTargetLength={setTargetLength}
              onApplyTargetLengthToAll={(len) =>
                setQuestions((prev) => prev.map((q) => ({ ...q, targetLength: len })))
              }
              tone={tone}
              setTone={setTone}
              subheadingStyle={subheadingStyle}
              setSubheadingStyle={setSubheadingStyle}
              selectedKeywords={selectedKeywords}
              setSelectedKeywords={setSelectedKeywords}
            />

            {/* Big Action CTA Banner */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl shadow-xl text-center space-y-4 text-white">
              <h3 className="text-xl sm:text-2xl font-black">
                준비가 되셨나요? {questions.length}개 문항 전체를 AI 자동 매칭으로 생성하세요!
              </h3>
              <p className="text-xs sm:text-sm text-amber-50 max-w-xl mx-auto opacity-95">
                보유하신 {experiences.length}개의 STAR 경험 중 질문마다 가장 시너지가 나는 경험을 AI가 똑똑하게 선별하여, 매력적인 소제목과 완성도 높은 본문으로 일괄 제작합니다.
              </p>

              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-gray-950 font-black text-base sm:text-lg rounded-2xl shadow-lg hover:bg-amber-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
                  <span>✨ {questions.length}개 문항 최적 경험 자동 매칭 &amp; 일괄 생성</span>
                  <ArrowRight className="w-5 h-5 text-amber-600" />
                </button>
              </div>

              {(!company.trim() || !role.trim()) && (
                <p className="text-[11px] text-amber-100 font-semibold">
                  * 필수 항목: 지원 기업명과 지원 직무를 입력해주세요.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-200 bg-white text-center text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700">
          STAR-Craft 자소서 오토 • 대한민국 취준생 여러분의 서류 합격을 진심으로 응원합니다.
        </p>
        <p className="text-gray-400 text-[11px]">
          작성된 경험 데이터는 브라우저 로컬 스토리지에만 보관되며 외부 서버에 영구 저장되지 않습니다.
        </p>
      </footer>

      {/* Loading Modal with Cute B-grade Animation and Rotating Messages */}
      <LoadingModal
        isOpen={isGenerating}
        companyName={company}
        roleName={role}
        targetLength={targetLength}
        questionCount={questions.length}
      />

      {/* Educational STAR Guide Modal */}
      <StarGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Experience Vault Modal */}
      <ExperienceVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        savedExperiences={savedExperiences}
        onSelectExperience={handleSelectExperienceFromVault}
        onSaveExperience={handleSaveExperience}
        onDeleteExperience={handleDeleteExperience}
        onImportExperiences={handleImportExperiences}
      />
    </div>
  );
}
