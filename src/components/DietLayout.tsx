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
      <div className="flex -mx-6 -mt-6 -mb-6 min-h-[calc(100vh-4rem)]">
        <DietSidebar />
        <div className="flex-1 p-6 min-w-0">{children}</div>
      </div>
    </Layout>
  );
}
