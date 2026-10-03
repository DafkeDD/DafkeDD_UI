"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Badge, Button, Icon, ThemeToggle } from "@dafke/ui";
import { Link } from "@/i18n/navigation";
import { DocsNav } from "./docs-nav";
import { LocaleSwitcher } from "./locale-switcher";

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("shell");

  return (
    <div className="docs-shell">
      <DocsNav open={open} />
      <div className="docs-main">
        <header className="docs-topbar">
          <Button
            variant="ghost"
            size="sm"
            className="docs-nav-toggle"
            aria-label={t("openNav")}
            icon={<Icon name="menu" />}
            onClick={() => setOpen((value) => !value)}
          />
          <Link href="/docs" style={{ fontWeight: 650, fontSize: 14.5, textDecoration: "none" }}>
            {t("docs")}
          </Link>
          <Badge tone="accent" size="sm">v0.1.0</Badge>
          <span style={{ flex: 1 }} />
          <LocaleSwitcher />
          <ThemeToggle size="sm" />
        </header>
        {children}
      </div>
    </div>
  );
}
