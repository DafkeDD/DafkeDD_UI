"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Icon, Input } from "@dafke/ui";
import { Link, usePathname } from "@/i18n/navigation";
import { COMPONENTS, componentsByCategory, entryTag } from "@/content/catalog";
import { DocsTag } from "./docs-tag";

const START_LINKS = [
  { href: "/docs", key: "intro", icon: "sparkles" as const },
  { href: "/docs/installatie", key: "installation", icon: "download" as const },
  { href: "/docs/theming", key: "theming", icon: "layers" as const },
] as const;

/** Categorieën uit de catalogus koppelen aan een vertaalsleutel. */
const CATEGORY_KEYS: Record<string, string> = {
  Basis: "basis",
  Formulieren: "forms",
  Overlays: "overlays",
  Navigatie: "navigation",
  "Datum & planning": "scheduling",
  Data: "data",
  Feedback: "feedback",
  Layout: "layout",
  Motion: "motion",
};

export function DocsNav({ open }: { open?: boolean }) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const t = useTranslations("nav");
  const tCategory = useTranslations("categories");

  const tag = (entry: { isNew?: boolean; isUpdated?: boolean }) => {
    const kind = entryTag(entry);
    return kind ? <DocsTag kind={kind} label={t(kind)} /> : null;
  };

  const hits = COMPONENTS.filter((c) => match(c.name, query) || match(c.description, query));

  // Zonder zoekterm: de categorieën uit de catalogus, met vertaald label.
  // Met zoekterm: één groep met het aantal resultaten als titel.
  const sections = query.trim()
    ? [{ title: t("results", { count: hits.length }), items: hits }]
    : componentsByCategory().map((group) => ({
        title: CATEGORY_KEYS[group.category] ? tCategory(CATEGORY_KEYS[group.category]) : group.category,
        items: group.items,
      }));

  return (
    <nav className="docs-nav" data-open={open ? "" : undefined}>
      <Link href="/" className="docs-nav-brand">
        <span className="docs-nav-mark">L</span>
        <span>
          <span className="docs-nav-name">Dafke UI</span>
          <span className="docs-nav-sub">{t("subtitle")}</span>
        </span>
      </Link>

      <Input
        size="sm"
        prefix={<Icon name="search" />}
        placeholder={t("search")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {!query && (
        <div className="docs-nav-group">
          <div className="docs-nav-group-title">{t("start")}</div>
          {START_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="docs-nav-link"
              data-active={pathname === link.href ? "" : undefined}
            >
              <Icon name={link.icon} size={15} />
              {t(link.key)}
            </Link>
          ))}
        </div>
      )}

      {sections.map((section) => (
        <div className="docs-nav-group" key={section.title}>
          <div className="docs-nav-group-title">{section.title}</div>
          {section.items.map((item) => {
            const href = `/docs/componenten/${item.slug}`;
            return (
              <Link key={item.slug} href={href} className="docs-nav-link" data-active={pathname === href ? "" : undefined}>
                {item.name}
                {tag(item)}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function match(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}
