"use client";
import { useState } from "react";
import { Badge, Icon, Text, Tree, TreeItem } from "@dafke/ui";

export default function Demo() {
  const [gekozen, setGekozen] = useState("packages/ui/src/components/button.tsx");

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <Tree
        defaultExpanded={["packages", "packages/ui", "packages/ui/src", "packages/ui/src/components"]}
        value={gekozen}
        onValueChange={setGekozen}
      >
        <TreeItem value="packages" label="packages">
          <TreeItem value="packages/ui" label="ui" trailing="104">
            <TreeItem value="packages/ui/src" label="src">
              <TreeItem value="packages/ui/src/components" label="components">
                <TreeItem value="packages/ui/src/components/button.tsx" label="button.tsx" />
                <TreeItem value="packages/ui/src/components/tree.tsx" label="tree.tsx" />
              </TreeItem>
              <TreeItem value="packages/ui/src/lib" label="lib" />
              <TreeItem value="packages/ui/src/styles" label="styles" />
            </TreeItem>
          </TreeItem>
          <TreeItem value="packages/cli" label="cli" icon={<Icon name="terminal" size={15} />} />
        </TreeItem>
        <TreeItem value="apps" label="apps">
          <TreeItem value="apps/docs" label="docs" />
        </TreeItem>
        <TreeItem value="registry" label="registry" disabled trailing="gegenereerd" />
      </Tree>

      <Text variant="small" tone="muted">
        Gekozen: <Badge tone="neutral">{gekozen}</Badge>
      </Text>
    </div>
  );
}
