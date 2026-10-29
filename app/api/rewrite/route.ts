import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";
import { RewriteRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: RewriteRequest = await req.json();
    const {
      company,
      role,
      question,
      title,
      content,
      action,
      customInstruction,
      targetLength = 700,
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: "재작성할 원본 본문이 없습니다." },
        { status: 400 }
      );
    }

    let instructionDetails = "";
    switch (action) {
      case "shorten":
        instructionDetails = `현재 글을 핵심 메시지와 성과 위주로 군더더기 없이 압축하여 작성하십시오. 목표 글자 수는 현재보다 약 15~20% 축소된 약 ${Math.round(targetLength * 0.8)}자 내외입니다. 문맥의 자연스러움과 격식은 유지하십시오.`;
        break;
      case "expand":
        instructionDetails = `현재 글에서 지원자의 구체적인 행동(Action) 과정과 그로부터 얻은 인사이트/직무 기여도(Result)를 더욱 풍부하고 입체적으로 보강하십시오. 목표 글자 수는 현재보다 약 15~20% 확대된 약 ${Math.round(targetLength * 1.15)}자 내외입니다. 과장이나 거짓 없이 인과관계를 구체화하십시오.`;
        break;
      case "more_professional":
        instructionDetails = `기업 최고위 임원 및 보수적인 대기업 서류 심사위원도 신뢰할 수 있도록, 지극히 정제되고 논리 정연한 최고급 비즈니스 격식체로 문장들을 다듬으십시오. 불필요한 미사여구를 걷어내고 명확한 어휘를 사용하십시오.`;
        break;
      case "new_subheadings":
        instructionDetails = `본문의 핵심 역량을 한눈에 어필할 수 있는 완전히 새로운 매력적인 소제목 3가지를 고민하고, 가장 뛰어난 1가지를 title 필드에 반영하고 나머지 2가지는 feedback 필드에 추천 목록으로 소개하십시오.`;
        break;
      case "custom":
        instructionDetails = `지원자의 다음 요청사항을 반영하여 재작성하십시오: "${customInstruction || "전체적인 완성도를 높여주세요."}"`;
        break;
      default:
        instructionDetails = "문맥을 더 깔끔하고 가독성 높게 교정하십시오.";
    }

    const prompt = `
당신은 대한민국 최고 수준의 전문 자기소개서 컨설턴트입니다.
지원 기업: ${company || "지원 기업"}
지원 직무: ${role || "지원 직무"}
${question ? `해당 자기소개서 문항: ${question}` : ""}

[기존 소제목]
${title || ""}

[기존 본문]
${content}

[재작성 미션]
${instructionDetails}

[주의사항]
- 사실 관계를 왜곡하거나 허위 사실을 추가하지 마십시오.
- 기업 제출용 완성형 문체(~합니다, ~했습니다)를 유지하십시오.
- 새로운 소제목(title)과 수정된 본문(content), 그리고 수정 포인트 및 피드백(feedback)을 반환하십시오.
`;

    const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash"];
    let text: string | null = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "재작성된 소제목",
                },
                content: {
                  type: Type.STRING,
                  description: "재작성된 본문",
                },
                feedback: {
                  type: Type.STRING,
                  description: "어떤 점이 개선되었는지에 대한 친절한 코멘트",
                },
              },
              required: ["title", "content", "feedback"],
            },
          },
        });
        if (response.text) {
          text = response.text;
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

    if (!text) {
      throw lastError || new Error("AI 응답을 생성하지 못했습니다.");
    }

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Rewrite API error:", error);
    const isQuotaError =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "현재 AI 서버 무료 사용량 한도(분당 5회)에 도달했습니다. 약 30초 후 다시 재작성을 시도해주세요.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "자소서 재작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
