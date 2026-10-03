import { notFound } from "next/navigation";
import Link from "next/link";
import { Alert, Badge, Button, Icon } from "@dafke/ui";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { COMPONENTS, componentBySlug, entryTag } from "@/content/catalog";
import { CodeBlock } from "@/components/code-block";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { demoSource, uiSource } from "@/lib/source";

export function generateStaticParams() {
  return COMPONENTS.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = componentBySlug(slug);
  return {
    title: component ? `${component.name} — Dafke UI` : "Dafke UI",
    description: component?.description,
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("component");
  const component = componentBySlug(slug);
  if (!component) notFound();

  const index = COMPONENTS.findIndex((entry) => entry.slug === slug);
  const previous = COMPONENTS[index - 1];
  const next = COMPONENTS[index + 1];
  const sourceFile = component.files.find((file) => file.endsWith(".tsx"));
  const source = sourceFile ? uiSource(sourceFile.startsWith("../") ? sourceFile.replace("../", "") : `components/${sourceFile}`) : "";

  return (
    <div className="docs-body">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge tone="accent">{component.category}</Badge>
        {entryTag(component) === "new" && (
          <Badge tone="green" icon={<Icon name="sparkles" size={12} />}>
            {tNav("new")}
          </Badge>
        )}
        {entryTag(component) === "updated" && (
          <Badge tone="amber" icon={<Icon name="refresh" size={12} />}>
            {tNav("updated")}
          </Badge>
        )}
      </div>
      <h1 className="docs-title" style={{ marginTop: 14 }}>{component.name}</h1>
      <p className="docs-lead">{component.description}</p>

      <div className="docs-section">
        <h2 className="docs-section-title">{t("install")}</h2>
        <CodeBlock standalone code={`npx dafke-ui add ${component.slug}`} />
        <p className="docs-p">
          {t("copies")}{" "}
          {component.files.map((file, fileIndex) => (
            <span key={file}>
              <code className="docs-inline-code">{file.replace("../", "")}</code>
              {fileIndex < component.files.length - 1 ? ` ${t("and")} ` : ""}
            </span>
          ))}
          {component.dependsOn?.length ? (
            <>
              {" "}{t("andTakes")}{" "}
              {component.dependsOn.map((dependency, dependencyIndex) => (
                <span key={dependency}>
                  <Link href={`/docs/componenten/${dependency}`} style={{ color: "var(--accent)" }}>
                    {dependency}
                  </Link>
                  {dependencyIndex < (component.dependsOn?.length ?? 0) - 1 ? ", " : ""}
                </span>
              ))}{" "}
              {t("along")}
            </>
          ) : (
            t("intoProject")
          )}
        </p>
      </div>

      {component.demos.map((demo) => (
        <div className="docs-section" key={demo.key}>
          <h2 className="docs-section-title">
            {demo.title}
            {entryTag(demo) && (
              <Badge
                tone={entryTag(demo) === "new" ? "green" : "amber"}
                size="sm"
                style={{ marginLeft: 10, verticalAlign: "middle" }}
              >
                {tNav(entryTag(demo)!)}
              </Badge>
            )}
          </h2>
          {demo.description && <p className="docs-section-desc">{demo.description}</p>}
          <Preview demoKey={demo.key} code={demoSource(demo.key)} align={demo.align} />
        </div>
      ))}

      {component.notes?.length ? (
        <div className="docs-section">
          <h2 className="docs-section-title">{t("notes")}</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {component.notes.map((note) => (
              <Alert key={note} tone="blue" icon={<Icon name="info" size={17} />}>
                {note}
              </Alert>
            ))}
          </div>
        </div>
      ) : null}

      {component.props?.length ? (
        <div className="docs-section">
          <h2 className="docs-section-title">API</h2>
          <p className="docs-section-desc">
            Rechtstreeks uit de TypeScript-bron gegenereerd — deze tabel kan dus niet verouderen.
          </p>
          {component.props.map((name) => (
            <PropsTable key={name} name={name} />
          ))}
        </div>
      ) : null}

      {source && (
        <details className="docs-section">
          <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>
            Volledige broncode van {component.name}
          </summary>
          <CodeBlock standalone code={source} />
        </details>
      )}

      <div className="docs-section" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {previous ? (
          <Button variant="secondary" asChild icon={<Icon name="arrowLeft" />}>
            <Link href={`/docs/componenten/${previous.slug}`}>{previous.name}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button variant="secondary" asChild iconRight={<Icon name="arrowRight" />}>
            <Link href={`/docs/componenten/${next.slug}`}>{next.name}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
