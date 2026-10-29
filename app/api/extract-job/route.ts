import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageBase64, mimeType } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "분석할 텍스트나 공고 이미지를 제공해주세요." },
        { status: 400 }
      );
    }

    let contents: any;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/png",
            },
          },
          {
            text: `이 채용공고 이미지를 정밀 분석하여 기업명, 채용 직무, 주요 업무, 자격요건, 우대사항 및 자소서 작성 시 반드시 어필해야 할 핵심 키워드를 추출해주세요.`,
          },
        ],
      };
    } else {
      contents = `다음 채용공고 내용을 정밀 분석하여 기업명, 채용 직무, 주요 업무, 자격요건, 우대사항 및 자소서 작성 시 반드시 어필해야 할 핵심 키워드를 추출해주세요.\n\n[채용공고 본문]\n${text}`;
    }

    const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash"];
    let output: string | null = null;
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
                companyName: {
                  type: Type.STRING,
                  description: "공고에서 감지된 기업명 (확인 불가 시 빈 문자열)",
                },
                roleName: {
                  type: Type.STRING,
                  description: "공고에서 감지된 직무명 (확인 불가 시 빈 문자열)",
                },
                talentProfile: {
                  type: Type.STRING,
                  description: "공고에서 언급된 기업 인재상, 핵심가치 또는 기업 비전 (언급 없으면 빈 문자열)",
                },
                summary: {
                  type: Type.STRING,
                  description: "공고의 주요 업무 및 요구사항 요약 (3~5줄)",
                },
                recommendedKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "자소서에 녹여내면 합격률이 올라갈 핵심 직무 키워드 5~8개",
                },
                keyRequirements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "채용 시 가장 중점적으로 평가하는 필수/우대 역량 포인트 3가지",
                },
              },
              required: ["summary", "recommendedKeywords", "keyRequirements"],
            },
          },
        });
        if (response.text) {
          output = response.text;
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

    if (!output) {
      throw lastError || new Error("채용공고 분석 결과를 생성하지 못했습니다.");
    }

    const parsed = JSON.parse(output);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Job extraction error:", error);
    const isQuotaError =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "현재 AI 서버 무료 사용량 한도(분당 5회)에 도달했습니다. 약 30초 후 다시 시도해주세요.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "채용공고 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
