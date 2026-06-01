"use client";

import { useEffect } from "react";

interface PrintLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PrintLayout({ title, subtitle, children }: PrintLayoutProps) {
  useEffect(() => {
    const handlePrint = () => window.print();
    // Auto-print after a short delay to ensure content is rendered
    const timer = setTimeout(handlePrint, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-layout">
      <div className="print-header hidden print:block">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Generated: {new Date().toLocaleString()}
        </p>
      </div>
      {children}
    </div>
  );
}