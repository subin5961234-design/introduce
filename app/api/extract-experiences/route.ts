import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fileBase64, mimeType, fileName } = body;

    if (!text && !fileBase64) {
      return NextResponse.json(
        { error: "분석할 파일이나 경험 텍스트를 제공해주세요." },
        { status: 400 }
      );
    }

    let contents: any;

    if (fileBase64) {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "application/pdf",
            },
          },
          {
            text: `당신은 대한민국 대기업 및 주요 IT기업 취업/자기소개서 전문 컨설턴트입니다.
업로드된 파일(이력서, 포트폴리오, 경험 정리 문서, 또는 캡처 이미지)을 면밀히 분석하세요.

[핵심 지침]
1. 사용자는 이 파일 하나에 여러 개의 과거 프로젝트, 인턴, 대외활동, 업무 경험, 공모전, 팀 프로젝트 등을 함께 모아 정리해 두었을 확률이 매우 높습니다.
2. 문서 내에 등장하는 각기 다른 프로젝트나 경험들을 하나도 누락하지 말고 **각각 독립된 개별 STAR 경험**으로 정확히 분리하여 추출하세요. (보통 1개에서 5개 이상)
3. 각 경험을 STAR(Situation-상황, Task-과제, Action-핵심행동, Result-성과/배운점) 원칙에 맞추어 전문적이고 읽기 쉬운 문장으로 정리하세요.
   - S (Situation): 당시의 배경, 팀 구성, 마주했던 환경
   - T (Task): 반드시 해결해야 했던 문제, 달성해야 했던 목표
   - A (Action): 지원자가 주도적으로 고민하고 직접 실행한 구체적인 해결 행동 및 협업 방식 (가장 중요)
   - R (Result): 정량적/정성적 성과 수치와 교훈
4. 각 경험별로 한눈에 알아볼 수 있는 명확한 제목(title)과 카테고리(category), 핵심 역량 키워드(keywords)를 생성해주세요.`,
          },
        ],
      };
    } else {
      contents = `당신은 대한민국 대기업 및 주요 IT기업 취업/자기소개서 전문 컨설턴트입니다.
다음 지원자의 경험 정리 텍스트를 면밀히 분석하세요.

[지원자 경험 본문]
${text}

[핵심 지침]
1. 사용자는 이 텍스트 안에 여러 개의 프로젝트, 인턴, 대외활동, 업무 경험, 공모전 등을 함께 모아 적어 두었을 확률이 높습니다.
2. 본문에 등장하는 각기 다른 프로젝트나 경험들을 개별 독립된 STAR 경험으로 분리하여 추출하세요.
3. 각 경험을 STAR 원칙에 맞춰 정리하세요:
   - S (Situation): 당시의 배경, 팀 구성, 마주했던 환경
   - T (Task): 반드시 해결해야 했던 문제, 달성해야 했던 목표
   - A (Action): 지원자가 주도적으로 고민하고 직접 실행한 구체적인 해결 행동 및 협업 방식 (가장 중요)
   - R (Result): 정량적/정성적 성과 수치와 교훈
4. 각 경험별로 명확한 제목(title), 카테고리(category), 핵심 역량 키워드(keywords)를 생성해주세요.`;
    }

    const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash"];
    let outputText: string | null = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                experiences: {
                  type: Type.ARRAY,
                  description: "파일/텍스트에서 감지 및 구조화된 모든 STAR 경험 목록",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: {
                        type: Type.STRING,
                        description: "경험/프로젝트를 대표하는 명확한 제목 (예: 대용량 트래픽 최적화 프로젝트)",
                      },
                      category: {
                        type: Type.STRING,
                        description: "경험 직무 분야 (예: IT / 개발, 마케팅 / 기획, 경영지원 / 전략, 디자인, 대외활동)",
                      },
                      situation: {
                        type: Type.STRING,
                        description: "상황 및 배경 (Situation) - 1~2문장",
                      },
                      task: {
                        type: Type.STRING,
                        description: "과제 및 직면 난관 (Task) - 1~2문장",
                      },
                      action: {
                        type: Type.STRING,
                        description: "지원자가 주도적으로 취한 구체적 행동 (Action) - 2~4문장",
                      },
                      result: {
                        type: Type.STRING,
                        description: "정량/정성적 성과 및 교훈 (Result) - 1~2문장",
                      },
                      keywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "핵심 역량 키워드 3~5개 (예: 문제해결력, 데이터분석, 협업, 최적화)",
                      },
                    },
                    required: ["title", "situation", "task", "action", "result"],
                  },
                },
                analysisSummary: {
                  type: Type.STRING,
                  description: "추출된 경험들에 대한 지원자 맞춤 응원 및 요약 코멘트 1~2줄",
                },
              },
              required: ["experiences", "analysisSummary"],
            },
          },
        });
        if (response.text) {
          outputText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const isQuota =
          err?.status === 429 ||
          err?.message?.includes("429") ||
          err?.message?.includes("RESOURCE_EXHAUSTED");
        if (isQuota) continue;
        throw err;
      }
    }

    if (!outputText) {
      throw lastError || new Error("경험 추출 결과를 생성하지 못했습니다.");
    }

    const parsed = JSON.parse(outputText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Experience extraction error:", error);
    const isQuotaError =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "현재 AI 서버 무료 사용량 한도(분당 5회)에 도달했습니다. 약 30초 후 다시 파일 분석을 시도해주세요.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "경험 분석 및 추출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
