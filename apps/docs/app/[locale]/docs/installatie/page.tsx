import { getTranslations, setRequestLocale } from "next-intl/server";
import { Alert, Badge, Card, CardContent, Stepper } from "@dafke/ui";
import { CodeBlock } from "@/components/code-block";
import { richTags } from "@/components/rich";

export default async function InstallatiePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("install");

  return (
    <div className="docs-body">
      <Badge tone="accent">{t("badge")}</Badge>
      <h1 className="docs-title" style={{ marginTop: 14 }}>{t("title")}</h1>
      <p className="docs-lead">{t("lead")}</p>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("s1Title")}</h2>
        <p className="docs-p">{t("s1Text")}</p>
        <CodeBlock
          standalone
          code={"npm install\nnpm run dev      # documentatiesite op http://localhost:3000 (of 3001, 3002, ... als 3000 bezet is)\nnpm run registry # registry + props-tabellen opnieuw genereren"}
        />
        <p className="docs-p">{t.rich("s1Structure", richTags)}</p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("s2Title")}</h2>
        <Stepper
          steps={[
            { label: "init", description: t("stepInit") },
            { label: "add", description: t("stepAdd") },
            { label: t("stepImport"), description: t("stepImportDesc") },
          ]}
          current={2}
          style={{ marginTop: 18, marginBottom: 22 }}
        />
        <CodeBlock
          standalone
          code={"# eenmalig: tokens, basis-CSS en hulpfuncties\nnpx dafke-ui init\n\n# daarna per component\nnpx dafke-ui add button card dialog\n\n# alles in één keer\nnpx dafke-ui add --all\n\n# later: alles bijwerken + nieuwe componenten erbij\nnpx dafke-ui update\n\n# overzicht van wat er beschikbaar is\nnpx dafke-ui list"}
        />
        <p className="docs-p">{t.rich("s2Init", richTags)}</p>

        <Alert tone="blue" title={t("npmTitle")} style={{ marginTop: 16 }}>
          {t.rich("npmBody", richTags)}
        </Alert>

        <p className="docs-p">{t.rich("s2Index", richTags)}</p>
        <p className="docs-p">{t.rich("s2Update", richTags)}</p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("s3Title")}</h2>
        <p className="docs-p">{t("s3Text")}</p>
        <CodeBlock
          standalone
          code={'/* app/globals.css */\n@import "tailwindcss";                  /* optioneel: Tailwind als engine */\n@import "./components/ui/ui.css";       /* tokens + alle gekopieerde componenten */\n@import "./components/ui/tailwind.css"; /* optioneel: tokens als Tailwind-utilities */'}
        />
        <Alert tone="amber" title={t("twTitle")} style={{ marginTop: 16 }}>
          {t.rich("twBody", richTags)}
        </Alert>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("s4Title")}</h2>
        <p className="docs-p">{t("s4Text")}</p>
        <CodeBlock
          standalone
          code={`// app/layout.tsx
import { ThemeProvider, ThemeScript, ToastProvider } from "@/components/ui";

export default function RootLayout({ children }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}`}
        />
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("fontsTitle")}</h2>
        <p className="docs-p">{t.rich("fontsText", richTags)}</p>
        <CodeBlock
          standalone
          code={'<link\n  href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400,500,600,700,800&family=JetBrains+Mono:wght@400,600&display=swap"\n  rel="stylesheet"\n/>'}
        />
      </div>

      <div className="docs-section">
        <Card>
          <CardContent>
            <div style={{ fontWeight: 650, marginBottom: 6 }}>{t("reqTitle")}</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-2)", lineHeight: 1.9 }}>
              <li>{t("req1")}</li>
              <li>{t("req2")}</li>
              <li>{t("req3")}</li>
              <li>{t("req4")}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
