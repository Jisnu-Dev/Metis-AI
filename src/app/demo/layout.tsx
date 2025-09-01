import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo - Metis AI',
  description: 'AI-powered Life Cycle Assessment platform demo',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="demo-layout">
      {children}
    </div>
  );
}