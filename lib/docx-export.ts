import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { GeneratedQuestionResult } from "./types";

interface ExportDocxParams {
  company: string;
  role: string;
  items: GeneratedQuestionResult[];
  // Fallback single item fields
  question?: string;
  title?: string;
  content?: string;
  charCount?: number;
  charCountNoSpaces?: number;
}

export async function downloadDocx({
  company,
  role,
  items = [],
  question,
  title,
  content,
  charCount,
  charCountNoSpaces,
}: ExportDocxParams) {
  // If single item fallback was passed
  const questionItems: GeneratedQuestionResult[] =
    items.length > 0
      ? items
      : [
          {
            id: "single",
            question: question || "지원동기 및 직무 역량",
            title: title || "[자기소개서]",
            content: content || "",
            targetLength: charCount || 700,
            charCount: charCount || content?.length || 0,
            charCountNoSpaces:
              charCountNoSpaces || content?.replace(/\s/g, "").length || 0,
            keyHighlights: [],
            feedback: "",
          },
        ];

  const totalCharsWithSpaces = questionItems.reduce(
    (acc, curr) => acc + (curr.content?.length || 0),
    0
  );
  const totalCharsNoSpaces = questionItems.reduce(
    (acc, curr) => acc + (curr.content?.replace(/\s/g, "").length || 0),
    0
  );

  const documentChildren: Paragraph[] = [
    // Header
    new Paragraph({
      text: `${company || "지원기업"} | ${role || "지원직무"} 입사지원 자기소개서`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `총 ${questionItems.length}개 문항 | 작성일: ${new Date().toLocaleDateString(
            "ko-KR"
          )} | 전체 글자 수: 공백 포함 ${totalCharsWithSpaces.toLocaleString()}자 (공백 제외 ${totalCharsNoSpaces.toLocaleString()}자)`,
          color: "666666",
          size: 19, // 9.5pt
        }),
      ],
      spacing: { after: 260 },
    }),
    new Paragraph({
      text: "══════════════════════════════════════════════════════",
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
    }),
  ];

  // Render each question block
  questionItems.forEach((item, index) => {
    const qNum = index + 1;
    const paragraphs = item.content
      .split("\n")
      .filter((line) => line.trim().length > 0);

    // Question Header
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[문항 ${qNum}] ${item.question}`,
            bold: true,
            size: 24, // 12pt
            color: "0F2942",
          }),
        ],
        spacing: { before: index > 0 ? 400 : 100, after: 80 },
      })
    );

    // Sub-info: Length info
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `글자 수: 공백 포함 ${(item.content?.length || 0).toLocaleString()}자 (목표 ${item.targetLength}자) / 공백 제외 ${(item.content?.replace(/\s/g, "").length || 0).toLocaleString()}자`,
            size: 18, // 9pt
            color: "777777",
            italics: true,
          }),
        ],
        spacing: { after: 180 },
      })
    );

    // Subheading (Title)
    const formattedTitle = item.title.startsWith("[")
      ? item.title
      : `[${item.title}]`;
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: formattedTitle,
            bold: true,
            size: 22, // 11pt
            color: "1D4ED8",
          }),
        ],
        spacing: { before: 80, after: 160 },
      })
    );

    // Paragraphs
    paragraphs.forEach((p) => {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p,
              size: 21, // 10.5pt
              font: "Malgun Gothic",
            }),
          ],
          spacing: { line: 360, after: 180 }, // 1.5 line spacing
        })
      );
    });

    // Divider between items (except last)
    if (index < questionItems.length - 1) {
      documentChildren.push(
        new Paragraph({
          text: "──────────────────────────────────────────────────────",
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 300 },
        })
      );
    }
  });

  // Document Footer
  documentChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "\n작성 솔루션: STAR-Craft | AI 맞춤형 자기소개서 빌더",
          size: 16,
          color: "999999",
          italics: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 500 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: documentChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const safeFilename = `${company || "기업"}_${role || "직무"}_자기소개서_전체문항.docx`.replace(
    /[\\/:*?"<>|]/g,
    "_"
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
