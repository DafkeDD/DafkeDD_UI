import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Badge, Button, Card, CardDescription, CardHeader, CardTitle, Icon, ThemeToggle,
} from "@dafke/ui";
import { Link } from "@/i18n/navigation";
import { COMPONENTS, entryTag } from "@/content/catalog";
import { CodeBlock } from "@/components/code-block";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { DocsTag } from "@/components/docs-tag";

const FEATURES = [
  { key: "zeroDeps", icon: "shield" as const },
  { key: "tokens", icon: "layers" as const },
  { key: "copyPaste", icon: "code" as const },
  { key: "theme", icon: "moon" as const },
] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // setRequestLocale blijft op Next 15 nodig voor statische rendering; de
  // deprecation verwijst naar next/root-params, dat pas in Next 16 bestaat.
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tShell = await getTranslations("shell");
  const tNav = await getTranslations("nav");

  return (
    <>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 30, height: 60,
          display: "flex", alignItems: "center", gap: 12, padding: "0 24px",
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="docs-nav-mark" style={{ width: 32, height: 32, fontSize: 15 }}>L</span>
        <strong style={{ fontSize: 15, letterSpacing: "-0.02em" }}>Dafke UI</strong>
        <Badge tone="accent" size="sm">v0.1.0</Badge>
        <span style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/docs">{tShell("docs")}</Link>
        </Button>
        <LocaleSwitcher />
        <ThemeToggle size="sm" />
      </header>

      <section className="docs-hero">
        <div className="docs-hero-inner">
          <Badge tone="accent" icon={<Icon name="sparkles" size={12} />}>
            {t("badge", { count: COMPONENTS.length })}
          </Badge>
          <h1 style={{ marginTop: 20 }}>
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>
          <p>{t("intro")}</p>
          <div className="docs-hero-actions">
            <Button size="lg" asChild>
              <Link href="/docs/componenten/button">{t("ctaComponents")}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/docs/installatie">{t("ctaInstall")}</Link>
            </Button>
          </div>
          <div style={{ maxWidth: 520, margin: "28px auto 0", textAlign: "left" }}>
            <CodeBlock code={"npx dafke-ui init\nnpx dafke-ui add button card dialog"} standalone />
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 90px" }}>
        <div className="docs-feature-grid">
          {FEATURES.map((feature) => (
            <Card key={feature.key}>
              <CardHeader>
                <div>
                  <span
                    style={{
                      display: "grid", placeItems: "center", width: 38, height: 38,
                      borderRadius: "var(--r-md)", background: "var(--accent-tint)",
                      color: "var(--accent)", marginBottom: 12,
                    }}
                  >
                    <Icon name={feature.icon} size={19} />
                  </span>
                  <CardTitle>{t(`features.${feature.key}.title`)}</CardTitle>
                  <CardDescription>{t(`features.${feature.key}.text`)}</CardDescription>
                </div>
              </CardHeader>
              <div style={{ height: 18 }} />
            </Card>
          ))}
        </div>

        <h2 className="docs-section-title" style={{ marginTop: 56 }}>{t("allTitle")}</h2>
        <p className="docs-section-desc">{t("allDescription")}</p>
        <div
          style={{
            display: "grid", gap: 10, marginTop: 20,
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          }}
        >
          {COMPONENTS.map((component) => (
            <Link
              key={component.slug}
              href={`/docs/componenten/${component.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                background: "var(--surface)", textDecoration: "none", fontSize: 13.5, fontWeight: 550,
              }}
            >
              <Icon name="chevronRight" size={14} />
              {component.name}
              {entryTag(component) && (
                <DocsTag kind={entryTag(component)!} label={tNav(entryTag(component)!)} />
              )}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
