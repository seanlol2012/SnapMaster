import './globals.css';

export const metadata = {
  title: 'SnapMaster — AI 摄影助手',
  description: '智能构图分析 · 修图 · Prompt 优化。AI 助你拍出更好的照片。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-base dot-grid antialiased">
        {children}
      </body>
    </html>
  );
}
