import { getTranslations, setRequestLocale } from "next-intl/server";
import { Alert, Badge, Button, Card, CardContent, Icon } from "@dafke/ui";
import { COMPONENTS, componentsByCategory, entryTag } from "@/content/catalog";
import { DocsTag } from "@/components/docs-tag";
import { richTags } from "@/components/rich";
import { Link } from "@/i18n/navigation";
import { ROADMAP } from "@/content/roadmap";

export default async function DocsIntroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("intro");
  const tNav = await getTranslations("nav");
  const tCategory = await getTranslations("categories");

  const groups = componentsByCategory();
  const done = ROADMAP.filter((step) => step.done).length;

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

  const kaarten = [
    { icon: "layers", titel: t("getComponents", { count: COMPONENTS.length }), tekst: t("getComponentsText") },
    { icon: "code", titel: t("getPrimitives"), tekst: t("getPrimitivesText") },
    { icon: "moon", titel: t("getTheme"), tekst: t("getThemeText") },
    { icon: "shield", titel: t("getA11y"), tekst: t("getA11yText") },
  ] as const;

  const regels = [
    { tone: "accent", titel: t("rule1Title"), body: t.rich("rule1Body", richTags) },
    { tone: "green", titel: t("rule2Title"), body: t.rich("rule2Body", richTags) },
    { tone: "amber", titel: t("rule3Title"), body: t.rich("rule3Body", richTags) },
  ] as const;

  return (
    <div className="docs-body">
      <Badge tone="accent">{t("badge")}</Badge>
      <h1 className="docs-title" style={{ marginTop: 14 }}>Dafke UI</h1>
      <p className="docs-lead">{t.rich("lead", richTags)}</p>

      <div className="docs-section">
        <h2 className="docs-section-title">
          {t("buildTitle")}{" "}
          <Badge tone="accent" size="sm">{t("buildBadge", { done, total: ROADMAP.length })}</Badge>
        </h2>
        <p className="docs-section-desc">{t("buildDesc")}</p>
        <div className="docs-roadmap">
          {ROADMAP.map((step, index) => (
            <div key={step.title} className="docs-roadmap-item" data-done={step.done ? "" : undefined}>
              <span className="docs-roadmap-step">
                {step.done ? <Icon name="check" size={14} strokeWidth={3} /> : index + 1}
              </span>
              <div>
                <div className="docs-roadmap-title">{step.title}</div>
                <div className="docs-roadmap-desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("getTitle")}</h2>
        <div className="docs-grid-2">
          {kaarten.map((item) => (
            <Card key={item.titel}>
              <CardContent>
                <span style={{ display: "inline-flex", color: "var(--accent)", marginBottom: 8 }}>
                  <Icon name={item.icon as "layers"} size={20} />
                </span>
                <div style={{ fontWeight: 650, fontSize: 14.5 }}>{item.titel}</div>
                <p style={{ fontSize: 13.5, marginTop: 4 }}>{item.tekst}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("rulesTitle")}</h2>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {regels.map((regel) => (
            <Alert key={regel.titel} tone={regel.tone} title={regel.titel}>
              {regel.body}
            </Alert>
          ))}
        </div>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("overviewTitle")}</h2>
        {groups.map((group) => (
          <div key={group.category} style={{ marginTop: 20 }}>
            <div className="lui-eyebrow">
              {CATEGORY_KEYS[group.category] ? tCategory(CATEGORY_KEYS[group.category]) : group.category}
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 10, gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/docs/componenten/${item.slug}`}
                  style={{
                    padding: "11px 13px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
                    background: "var(--surface)", textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                    {item.name}
                    {entryTag(item) && <DocsTag kind={entryTag(item)!} label={tNav(entryTag(item)!)} />}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="docs-section">
        <Button asChild>
          <Link href="/docs/installatie">{t("cta")}</Link>
        </Button>
      </div>
    </div>
  );
}
