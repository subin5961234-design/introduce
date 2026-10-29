"use client";

import React from "react";
import { X, CheckCircle, Lightbulb, Compass, Award, Star } from "lucide-react";
import { StarCraftMascot } from "./StarCraftMascot";

interface StarGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StarGuideModal({ isOpen, onClose }: StarGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-100 via-orange-50 to-emerald-50 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarCraftMascot mood="happy" size={56} />
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full mb-1">
                서류 합격 비법서
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                STAR 기법 완벽 작성 가이드
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white/80 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">
                인사담당자가 STAR를 극찬하는 이유
              </h4>
              <p className="text-amber-800 text-xs leading-relaxed">
                단순히 &quot;열심히 했습니다&quot;라는 주관적 주장 대신, 어떤 난관에서 <strong>지원자가 직접 주도한 행동(Action)</strong>과 <strong>수치화된 성과(Result)</strong>를 통해 실제 직무 적합성과 문제해결력을 가장 설득력 있게 증명하기 때문입니다.
              </p>
            </div>
          </div>

          {/* 4 Steps */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-amber-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                    S
                  </span>
                  <span className="font-bold text-gray-900">Situation (상황 / 배경)</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">권장 비중 15~20%</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                언제, 어디서, 어떤 프로젝트나 업무를 진행하던 중이었는지 배경을 간결하게 제시합니다.
              </p>
              <div className="text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                <span className="font-semibold text-blue-600">예시:</span> &quot;대학 해커톤에서 실시간 수강신청 시스템 개발 중 동시 접속 1,000명 초과로 서버 응답 시간이 4초까지 지연되는 문제가 발생했습니다.&quot;
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-amber-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-black text-sm flex items-center justify-center">
                    T
                  </span>
                  <span className="font-bold text-gray-900">Task (과제 / 직면 난관)</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">권장 비중 10~15%</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                내가 맡았던 핵심 역할과 해결해야만 했던 구체적인 목표나 제약 조건을 작성합니다.
              </p>
              <div className="text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                <span className="font-semibold text-orange-600">예시:</span> &quot;서버 증설 예산이 없는 상황에서, 핵심 조회 쿼리 p99 응답 속도를 1초 이내로 줄여 무중단 접속 환경을 구축해야 했습니다.&quot;
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 border-2 border-amber-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg">
                ★ 서류 합격의 핵심
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-sm flex items-center justify-center">
                    A
                  </span>
                  <span className="font-bold text-gray-900">Action (주도적 행동 / 시도)</span>
                </div>
                <span className="text-xs font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">권장 비중 45~50%</span>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                남들과 다르게 <strong>&apos;내가 주도적으로 취한 행동&apos;</strong>과 분석 과정, 협업 노력을 상세히 기재합니다.
              </p>
              <div className="text-xs bg-white p-2.5 rounded-xl border border-amber-200 text-gray-800">
                <span className="font-semibold text-amber-700">예시:</span> &quot;APM 프로파일러로 DB 슬로우 쿼리를 분석하여 Redis 캐싱 레이어를 신설하고, 복합 인덱스를 적용해 불필요한 테이블 풀스캔을 제거했습니다.&quot;
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center">
                    R
                  </span>
                  <span className="font-bold text-gray-900">Result (결과 / 배운 점)</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">권장 비중 20~25%</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                정량적 수치 성과, 정성적 반응, 그리고 이 경험을 통해 얻은 직무적 교훈을 기술합니다.
              </p>
              <div className="text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                <span className="font-semibold text-emerald-600">예시:</span> &quot;응답 속도를 4초에서 0.38초로 91% 단축하고 오류율 0%로 성공 개최했습니다. 데이터 기반 병목 진단의 중요성을 체득했습니다.&quot;
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-sky-600 shrink-0" />
            <p className="text-xs text-sky-900">
              STAR-Craft는 위 4가지 요소를 채용공고의 핵심 인재상과 결합하여, <strong>과장 없이 실제 역량이 가장 돋보이는 최고급 비즈니스 자소서</strong>로 자동 완성해 드립니다!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-sm active:scale-95"
          >
            이해했어요! 작성하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
