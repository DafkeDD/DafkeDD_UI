import { getTranslations, setRequestLocale } from "next-intl/server";
import { Alert, Badge, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@dafke/ui";
import { CodeBlock } from "@/components/code-block";
import { richTags } from "@/components/rich";
import { TOKEN_GROUPS, readTokens } from "@/lib/tokens";

export default async function ThemingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("theming");
  const tGroup = await getTranslations("tokenGroups");

  const tokens = readTokens();
  const find = (name: string) => tokens.find((token) => token.name === name);
  const radii = tokens.filter((token) => token.name.startsWith("--r-"));
  const shadows = tokens.filter((token) => token.name.startsWith("--sh-"));

  return (
    <div className="docs-body docs-body-wide">
      <Badge tone="accent">{t("badge")}</Badge>
      <h1 className="docs-title" style={{ marginTop: 14 }}>{t("title")}</h1>
      <p className="docs-lead">{t.rich("lead", richTags)}</p>

      <Alert tone="accent" title={t("sourceTitle")} style={{ marginTop: 22 }}>
        {t.rich("sourceBody", richTags)}
      </Alert>

      {TOKEN_GROUPS.map((group) => (
        <div className="docs-section" key={group.key}>
          <h2 className="docs-section-title">{tGroup(group.key)}</h2>
          <p className="docs-section-desc">{tGroup(`${group.key}Desc`)}</p>
          <div className="docs-swatches">
            {group.names.map((name) => {
              const token = find(name);
              return (
                <div className="docs-swatch" key={name}>
                  <div className="docs-swatch-color" style={{ background: `var(${name})` }} />
                  <div className="docs-swatch-meta">
                    <div className="docs-swatch-name">{name}</div>
                    <div className="docs-swatch-value">{token?.light ?? "—"}</div>
                    {token?.dark && <div className="docs-swatch-value">{t("dark")}: {token.dark}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="docs-section">
        <h2 className="docs-section-title">{t("radiusTitle")}</h2>
        <div className="docs-grid-2">
          <Card>
            <CardContent>
              <div className="lui-eyebrow" style={{ marginBottom: 14 }}>{t("radius")}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {radii.map((token) => (
                  <div key={token.name} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 62, height: 62, background: "var(--surface-3)",
                        border: "1px solid var(--border)", borderRadius: `var(${token.name})`,
                      }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, fontFamily: "var(--mono)" }}>
                      {token.name.replace("--r-", "")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="lui-eyebrow" style={{ marginBottom: 14 }}>{t("shadow")}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {shadows.map((token) => (
                  <div key={token.name} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 62, height: 62, background: "var(--surface)",
                        borderRadius: "var(--r-md)", boxShadow: `var(${token.name})`,
                      }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8, fontFamily: "var(--mono)" }}>
                      {token.name.replace("--sh-", "")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("recolorTitle")}</h2>
        <p className="docs-p">{t("recolorText")}</p>
        <CodeBlock
          standalone
          code={`:root {
  --accent: #0d9488;        /* hoofdkleur   */
  --accent-hover: #0f766e;  /* hover        */
  --accent-active: #115e59; /* actief       */
  --accent-tint: #f0fdfa;   /* zachte vlakken, actieve nav-items */
}

[data-theme="dark"] {
  --accent: #2dd4bf;
  --accent-fg: #04201d;
}`}
        />
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("densityTitle")}</h2>
        <p className="docs-p">{t.rich("densityText", richTags)}</p>
        <CodeBlock
          standalone
          code={`:root { --density: 1; }
[data-density="compact"] { --density: 0.86; }
[data-density="comfy"]   { --density: 1.14; }

/* in een component */
.lui-btn { height: calc(40px * var(--density)); }`}
        />
        <p className="docs-p">{t.rich("densityProvider", richTags)}</p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("allTitle")}</h2>
        <Table dense minWidth={620}>
          <TableHeader>
            <TableRow>
              <TableHead>{t("token")}</TableHead>
              <TableHead>{t("light")}</TableHead>
              <TableHead>{t("darkCol")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.name}>
                <TableCell strong>
                  <span className="docs-type">{token.name}</span>
                </TableCell>
                <TableCell>
                  <span className="docs-default">{token.light}</span>
                </TableCell>
                <TableCell>
                  <span className="docs-default">{token.dark ?? "—"}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
