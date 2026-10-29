import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STAR-Craft | AI 맞춤형 자기소개서 빌더',
  description: 'STAR 기법 기반으로 나의 실제 역량과 경험을 기업 채용공고에 완벽하게 매칭하는 맞춤형 자소서 생성 및 DOCX/PDF 다운로드 서비스',
  openGraph: {
    title: 'STAR-Craft | AI 맞춤형 자기소개서 빌더',
    description: 'STAR 기법 기반으로 나의 실제 역량과 경험을 기업 채용공고에 완벽하게 매칭하는 맞춤형 자소서 생성 및 DOCX/PDF 다운로드 서비스',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STAR-Craft | AI 맞춤형 자기소개서 빌더',
    description: 'STAR 기법 기반으로 나의 실제 역량과 경험을 기업 채용공고에 완벽하게 매칭하는 맞춤형 자소서 생성 및 DOCX/PDF 다운로드 서비스',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="font-sans antialiased text-[#2D3436] bg-[#FAFAFA] min-h-screen selection:bg-amber-200 selection:text-amber-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
