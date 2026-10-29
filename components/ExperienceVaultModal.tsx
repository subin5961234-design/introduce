"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Plus,
  Trash2,
  Edit2,
  FolderDown,
  Download,
  Upload,
  Sparkles,
  Check,
  Bookmark,
} from "lucide-react";
import { StarExperience } from "@/lib/types";
import { SAMPLE_STAR_PRESETS } from "@/lib/sample-data";

interface ExperienceVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedExperiences: StarExperience[];
  onSelectExperience: (exp: StarExperience) => void;
  onSaveExperience: (exp: StarExperience) => void;
  onDeleteExperience: (id: string) => void;
  onImportExperiences: (items: StarExperience[]) => void;
}

export function ExperienceVaultModal({
  isOpen,
  onClose,
  savedExperiences,
  onSelectExperience,
  onSaveExperience,
  onDeleteExperience,
  onImportExperiences,
}: ExperienceVaultModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingExp, setEditingExp] = useState<StarExperience | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedExperiences.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keywords || []).some((k) =>
        k.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(savedExperiences.map((e) => e.category).filter(Boolean))
  ) as string[];

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(savedExperiences, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `star_experiences_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportExperiences(parsed);
          alert(`${parsed.length}개의 STAR 경험을 보관함으로 가져왔습니다!`);
        }
      } catch (err) {
        alert("올바른 JSON 파일 형식이 아닙니다.");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPreset = (preset: StarExperience) => {
    onSelectExperience(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-md">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">
                  나만의 STAR 경험 보관함
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {savedExperiences.length}개 보관 중
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                자주 쓰는 성공 경험을 저장해 두고, 다른 기업 지원 시 언제든 1초 만에 불러오세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white/80 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Search & Buttons) */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="경험 제목, 액션, 키워드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingExp({
                  id: `star-${Date.now()}`,
                  title: "",
                  category: "일반 / 직무",
                  createdAt: new Date().toISOString().split("T")[0],
                  situation: "",
                  task: "",
                  action: "",
                  result: "",
                  keywords: [],
                });
                setIsCreatingNew(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              새 경험 등록
            </button>

            <button
              onClick={handleExportJSON}
              title="JSON 백업 파일로 내보내기"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              백업
            </button>

            <label className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-gray-500" />
              복원
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Quick Preset Buttons if list is small */}
          {savedExperiences.length <= 3 && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-amber-900">
                  처음이신가요? 고품질 실무 STAR 샘플로 바로 체험해보세요!
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_STAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 text-left bg-white hover:bg-amber-100/60 border border-amber-200/80 rounded-xl transition-all shadow-sm group"
                  >
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      {preset.category}
                    </span>
                    <p className="text-xs font-bold text-gray-800 mt-1 line-clamp-1 group-hover:text-amber-800">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {preset.action}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List of Experiences */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-medium">검색 결과 또는 저장된 경험이 없습니다.</p>
              <p className="text-xs mt-1">새 경험을 추가하거나 위의 추천 샘플을 불러와보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-gray-200 hover:border-amber-400 rounded-2xl transition shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        {item.category && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
                            {item.category}
                          </span>
                        )}
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {item.createdAt}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-3 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                      <p className="line-clamp-1">
                        <strong className="text-blue-600">S:</strong> {item.situation}
                      </p>
                      <p className="line-clamp-1">
                        <strong className="text-orange-600">T:</strong> {item.task}
                      </p>
                      <p className="line-clamp-2">
                        <strong className="text-amber-600">A:</strong> {item.action}
                      </p>
                      <p className="line-clamp-1">
                        <strong className="text-emerald-600">R:</strong> {item.result}
                      </p>
                    </div>

                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingExp(item);
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${item.title}' 경험을 삭제하시겠습니까?`)) {
                            onDeleteExperience(item.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onSelectExperience(item);
                        setCopiedId(item.id);
                        setTimeout(() => {
                          onClose();
                        }, 300);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          불러옴!
                        </>
                      ) : (
                        <>
                          <FolderDown className="w-3.5 h-3.5" />
                          폼에 불러오기
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Add / Edit Form Submodal */}
        {editingExp && (
          <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-base">
                {isCreatingNew ? "새 STAR 경험 보관하기" : "STAR 경험 수정"}
              </h4>
              <button
                onClick={() => setEditingExp(null)}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    경험 제목 / 프로젝트명 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 대용량 트래픽 대비 캐싱 최적화"
                    value={editingExp.title}
                    onChange={(e) =>
                      setEditingExp({ ...editingExp, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    카테고리 / 직무 분야
                  </label>
                  <input
                    type="text"
                    placeholder="예: IT/개발, 마케팅, 기획, 경영지원"
                    value={editingExp.category || ""}
                    onChange={(e) =>
                      setEditingExp({ ...editingExp, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-blue-700 mb-1">
                  S (Situation - 상황 / 배경)
                </label>
                <textarea
                  rows={2}
                  placeholder="어떤 조직/프로젝트에서 어떤 배경이었나요?"
                  value={editingExp.situation}
                  onChange={(e) =>
                    setEditingExp({ ...editingExp, situation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-orange-700 mb-1">
                  T (Task - 과제 / 직면 난관)
                </label>
                <textarea
                  rows={2}
                  placeholder="내가 해결해야 했던 문제나 달성해야 했던 목표는 무엇인가요?"
                  value={editingExp.task}
                  onChange={(e) =>
                    setEditingExp({ ...editingExp, task: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-700 mb-1">
                  A (Action - 주도적 행동) *핵심
                </label>
                <textarea
                  rows={3}
                  placeholder="문제 해결을 위해 내가 주도적으로 취한 구체적 접근법과 행동은?"
                  value={editingExp.action}
                  onChange={(e) =>
                    setEditingExp({ ...editingExp, action: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-700 mb-1">
                  R (Result - 성과 및 배운 점)
                </label>
                <textarea
                  rows={2}
                  placeholder="수치적 성과, 정성적 반응, 배운 점과 인사이트는 무엇인가요?"
                  value={editingExp.result}
                  onChange={(e) =>
                    setEditingExp({ ...editingExp, result: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingExp(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!editingExp.title.trim() || !editingExp.action.trim()) {
                    alert("경험 제목과 행동(Action)은 필수입니다.");
                    return;
                  }
                  onSaveExperience(editingExp);
                  setEditingExp(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow transition"
              >
                보관함에 저장
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>
            💡 브라우저 로컬 저장소에 안전하게 보관됩니다. (백업 파일 저장 권장)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
