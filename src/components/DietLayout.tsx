import { ReactNode } from "react";
import Layout from "./Layout";
import DietSidebar from "./DietSidebar";

interface DietLayoutProps {
  children: ReactNode;
  pageKey?: string;
}

export default function DietLayout({ children, pageKey }: DietLayoutProps) {
  return (
    <Layout pageKey={pageKey}>
      {/* 
        Negative margins cancel Layout's <main> padding so the sidebar 
        sits flush against the left edge of the viewport.
        The sidebar itself has pointer-events-auto to stay clickable 
        even when Layout applies pointer-events-none (no pageKey → readOnly).
      */}
      <div className="flex -mx-6 -mt-6 -mb-6 min-h-[calc(100vh-4rem)] pointer-events-auto">
        <DietSidebar />
        <div className="flex-1 p-6 min-w-0">{children}</div>
      </div>
    </Layout>
  );
}
