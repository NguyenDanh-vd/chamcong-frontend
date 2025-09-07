"use client";
import DesktopLayout from "@/layouts/DesktopLayout";
import { App, Card } from "antd";

export default function AdminPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DesktopLayout
      breadcrumbItems={[
        { title: "Admin" },
        { title },
      ]}
    >
      <App>
        {/* Sửa từ bordered={false} thành variant="borderless" */}
        <Card title={title} variant="borderless">
          {children}
        </Card>
      </App>
    </DesktopLayout>
  );
}
