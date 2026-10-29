import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";
import {
  QuestionDefinition,
  StarExperience,
  GeneratedQuestionResult,
  GenerationResponse,
} from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company,
      role,
      companyInfo = "",
      jobDescription = "",
      tone = "professional",
      keywords = [],
      subheadingStyle = "impact_number",
      questions = [],
      experiences = [],
      // Fallback compatibility
      items,
      question,
      star,
      targetLength = 700,
    } = body;

    if (!company || !role) {
      return NextResponse.json(
        { error: "지원 기업명과 지원 직무는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    // Normalize questions list
    let questionList: QuestionDefinition[] = [];
    if (Array.isArray(questions) && questions.length > 0) {
      questionList = questions;
    } else if (Array.isArray(items) && items.length > 0) {
      questionList = items.map((it, idx) => ({
        id: it.id || `q-${idx + 1}`,
        question: it.question || `문항 ${idx + 1}`,
        targetLength: it.targetLength || 700,
      }));
    } else {
      questionList = [
        {
          id: "q-1",
          question: question || "지원동기 및 직무 역량",
          targetLength: targetLength || 700,
        },
      ];
    }

    // Normalize experiences pool
    let experiencePool: StarExperience[] = [];
    if (Array.isArray(experiences) && experiences.length > 0) {
      experiencePool = experiences;
    } else if (Array.isArray(items) && items.some((it) => it.action)) {
      experiencePool = items
        .filter((it) => it.action)
        .map((it, idx) => ({
          id: `exp-${idx + 1}`,
          title: `경험 ${idx + 1}`,
          situation: it.situation || "",
          task: it.task || "",
          action: it.action || "",
          result: it.result || "",
        }));
    } else if (star) {
      experiencePool = [
        {
          id: "exp-1",
          title: "주요 프로젝트 경험",
          situation: star.situation || "",
          task: star.task || "",
          action: star.action || "",
          result: star.result || "",
        },
      ];
    }

    if (experiencePool.length === 0) {
      return NextResponse.json(
        { error: "적어도 하나 이상의 STAR 경험(상황, 행동 등)을 작성해주세요." },
        { status: 400 }
      );
    }

    const toneDescriptions: Record<string, string> = {
      professional: "논리적이고 신뢰감 넘치는 직무 전문가 톤. 감정적 수사 배제, 인과관계와 사실 기반 서술.",
      passionate: "주도적이고 진취적인 실행력 톤. 빠른 실행, 집요한 몰입과 도전 정신 강조.",
      collaborative: "조직 내 신뢰와 협업, 경청 및 시너지를 통한 상생 역량 강조 톤.",
    };

    const subheadingDescriptions: Record<string, string> = {
      impact_number: "구체적 숫자/성과 또는 성과 지표가 포함된 임팩트 있는 형태 (예: [3초의 지연을 0.2초로: 데이터 처리 파이프라인 최적화])",
      job_core: "핵심 직무 역량과 역할이 선명히 드러나는 직관형 (예: [고객 이탈을 방어하는 데이터 기반 UX 리디자인])",
      storytelling: "흥미를 유발하고 문제해결 과정을 함축하는 스토리텔링형 (예: [보이지 않는 병목에서 찾아낸 25%의 개선 기회])",
    };

    // Format experience pool for prompt
    const formattedExperiencePool = experiencePool
      .map(
        (exp, idx) => `
[보유 경험 ${idx + 1}: ${exp.title || `경험 ${idx + 1}`}]
- Situation (상황): ${exp.situation || "관련 배경"}
- Task (과제/목표): ${exp.task || "해결 과제"}
- Action (구체적 행동): ${exp.action}
- Result (성과 및 배운 점): ${exp.result || "성과 및 인사이트"}
`
      )
      .join("\n");

    const allQuestionPromptBlock = questionList
      .map(
        (q, idx) => `
[문항 ${idx + 1}]
- id: "${q.id}"
- 질문: ${q.question}
- 목표 글자 수: 약 ${q.targetLength}자 (공백 포함, ${Math.round(q.targetLength * 0.9)}자 ~ ${Math.round(q.targetLength * 1.1)}자 사이 엄수)
`
      )
      .join("\n");

    const prompt = `
당신은 대한민국 최고 수준의 채용 전문 수석 자소서 컨설턴트입니다.
지원자는 ${company}의 [${role}] 직무에 지원하며, 총 ${questionList.length}개 문항으로 구성된 자기소개서 패키지를 완성해야 합니다.

### [기본 지원 정보]
- 지원 기업: ${company}
- 지원 직무: ${role}
${companyInfo ? `- 목표 기업의 인재상 / 핵심가치 / 기업 정보:\n${companyInfo}\n` : ""}
${jobDescription ? `- 채용 공고 / 직무 요구사항 요약:\n${jobDescription}\n` : ""}
${keywords && keywords.length > 0 ? `- 녹여낼 핵심 키워드: ${keywords.join(", ")}` : ""}

### [작성해야 할 전체 문항 목록 (총 ${questionList.length}개)]
${allQuestionPromptBlock}

### [지원자가 보유한 STAR 경험 풀 (총 ${experiencePool.length}개)]
${formattedExperiencePool}

==================================================
### [AI의 핵심 임무 및 작성 원칙 (엄수)]
1. **문항별 최적 STAR 경험 자동 선별 및 스마트 배분**:
   - 각 질문의 평가 의도(지원동기, 기술적 난관 극복, 팀 협업/갈등 해결, 입사 후 포부 등)를 분석하십시오.
   - 각 문항마다 지원자의 보유 경험 풀 중 가장 부합하고 설득력 있는 경험을 선택하여 작성의 핵심 근거로 활용하십시오.
   - 전체 문항 간 동일한 경험이 단순 중복되지 않도록 문항별로 경험을 골고루 안배하십시오.
2. **기업 맞춤형 지원동기 & 인재상 밀착 연계 (가장 중요)**:
   - 해당 문항이 '지원동기', '회사 선택 이유', '입사 후 포부' 또는 기업과의 적합성을 묻는 경우:
     * 두루뭉술한 일반론적 칭찬은 엄격히 배제하십시오.
     * ${companyInfo ? `제공된 기업 인재상/핵심가치/기업 정보("${companyInfo}")를 적극 반영하여, 수많은 기업 중 '왜 반드시 ${company}이어야 하는지' 명확한 지원 이유와 가치관 일치점을 서술하십시오.` : `지원 기업(${company})의 차별화된 가치와 방향성을 분석하여, 지원자가 왜 이 기업을 선택했는지 구체적인 명분을 서술하십시오.`}
     * 지원자의 STAR 경험에서 증명된 태도와 역량이 기업의 인재상에 어떻게 부합하는지 자연스럽게 연결하십시오.
3. **과장 및 허위 작성 절대 금지**:
   - 지원자가 입력한 실제 경험의 팩트, 수치, 행동을 엄격히 바탕으로 서술하며, 가상의 경력을 지어내지 마십시오.
4. **격식 있는 비즈니스 문체**:
   - ${toneDescriptions[tone] || toneDescriptions.professional} (~습니다, ~하였습니다 등 정중하고 명확한 문체)
5. **소제목 구성**:
   - 각 문항마다 ${subheadingDescriptions[subheadingStyle] || subheadingDescriptions.impact_number} 스타일의 대괄호 소제목([소제목]) 1개 작성.
6. **글자 수 준수**:
   - 각 문항의 본문(content) 글자 수는 제시된 목표 글자 수의 ±10% 범위를 반드시 준수하십시오.
7. **JSON 응답 구조**:
   - items 배열에 요청된 각 문항(id, question, matchedExperienceTitle, matchReason, title, content, keyHighlights, feedback)을 모두 작성하고 overallFeedback을 작성하십시오.
`;

    const batchResponseSchema = {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: "문항별 생성 결과 목록",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "문항 ID" },
              question: { type: Type.STRING, description: "문항 질문" },
              matchedExperienceTitle: {
                type: Type.STRING,
                description: "선택하여 매칭한 지원자의 STAR 경험 제목",
              },
              matchReason: {
                type: Type.STRING,
                description: "이 문항에 해당 경험을 매칭한 이유 1문장",
              },
              title: {
                type: Type.STRING,
                description: "이 문항의 매력적인 대괄호 소제목",
              },
              content: {
                type: Type.STRING,
                description: "완성된 자기소개서 본문",
              },
              keyHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "핵심 역량 키워드 3가지",
              },
              feedback: {
                type: Type.STRING,
                description: "면접 대비 조언 및 합격 포인트 1문장",
              },
            },
            required: [
              "id",
              "question",
              "matchedExperienceTitle",
              "matchReason",
              "title",
              "content",
              "keyHighlights",
              "feedback",
            ],
          },
        },
        overallFeedback: {
          type: Type.STRING,
          description: "전체 자소서 패키지에 대한 총평 1~2문장",
        },
      },
      required: ["items", "overallFeedback"],
    };

    // Single request with fallback model on 429 quota
    const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash"];
    let responseText: string | null = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: batchResponseSchema,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed:`, err?.status || err?.message);
        lastError = err;
        const isQuota =
          err?.status === 429 ||
          err?.message?.includes("429") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("Quota exceeded");
        if (isQuota) {
          continue;
        }
        throw err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("자기소개서 생성 결과를 받지 못했습니다.");
    }

    const parsed = JSON.parse(responseText);

    const generatedResults: GeneratedQuestionResult[] = questionList.map(
      (q, idx) => {
        const found =
          parsed.items?.find((it: any) => it.id === q.id) || parsed.items?.[idx];
        const contentStr = found?.content || "";
        const qTargetLength = q.targetLength || 700;

        return {
          id: q.id,
          question: q.question,
          matchedExperienceTitle:
            found?.matchedExperienceTitle || "보유 STAR 경험",
          matchReason:
            found?.matchReason ||
            "문항 평가 의도에 부합하는 최적의 경험을 선별하여 작성했습니다.",
          title: found?.title || `[${company} ${role} 지원]`,
          content: contentStr,
          targetLength: qTargetLength,
          charCount: contentStr.length,
          charCountNoSpaces: contentStr.replace(/\s/g, "").length,
          keyHighlights: Array.isArray(found?.keyHighlights)
            ? found.keyHighlights
            : [],
          feedback: found?.feedback || "",
        };
      }
    );

    const overallFeedback =
      parsed.overallFeedback ||
      `${company} ${role} 직무 지원을 위해 보유하신 경험을 바탕으로 총 ${generatedResults.length}개 문항이 최적 매칭되어 일괄 완성되었습니다.`;

    const responsePayload: GenerationResponse = {
      items: generatedResults,
      overallFeedback,
      title: generatedResults[0]?.title,
      content: generatedResults[0]?.content,
      keyHighlights: generatedResults[0]?.keyHighlights,
      feedback: generatedResults[0]?.feedback,
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Generate API error:", error);
    const isQuotaError =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.includes("Quota exceeded") ||
      error?.message?.includes("quota");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "현재 AI 서버 무료 사용량 한도(분당 5회 요청)에 도달했습니다. 약 30초 후 다시 [문항 일괄 생성] 버튼을 눌러주시면 정상 생성됩니다.",
          isQuotaExceeded: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "자기소개서 일괄 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
