"use client";
import { Code, CodeBlock, Stack, Text } from "@dafke/ui";

const VOORBEELD = `import { Tree, TreeItem } from "@dafke/ui";

export function Mappen() {
  // De boom onthoudt zelf welke takken openstaan.
  return (
    <Tree defaultExpanded={["src"]}>
      <TreeItem value="src" label="src">
        <TreeItem value="index.ts" label="index.ts" />
      </TreeItem>
    </Tree>
  );
}`;

export default function Demo() {
  return (
    <Stack gap="md">
      <CodeBlock code={VOORBEELD} language="tsx" lineNumbers highlightLines={[6, 7]} />
      <Text variant="small" tone="muted">
        Losse code in een zin schrijf je met <Code>&lt;Code&gt;</Code>, zoals <Code>npm run dev</Code>.
      </Text>
      <CodeBlock code={"npm install\nnpx dafke-ui add tree"} language="shell" />
    </Stack>
  );
}
