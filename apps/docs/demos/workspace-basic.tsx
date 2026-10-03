"use client";
import {
  Badge, Button, Card, CardContent, Checkbox, Icon, ListRow, Progress, RowList,
  SectionHeader, Workspace, WorkspaceMain, WorkspacePanel, WorkspaceRail,
} from "@dafke/ui";

const STAPPEN = ["Anamnese", "Metingen", "Onderzoek", "Besluit", "Afronden"];

export default function Demo() {
  return (
    <Workspace left={230} right={280} stackAt={980}>
      <WorkspaceRail side="left">
        <WorkspacePanel>
          <SectionHeader size="sm" title="Stappen" actions={<span style={{ fontSize: 12, color: "var(--text-3)" }}>2/5</span>} />
          <div style={{ display: "grid", gap: 9 }}>
            {STAPPEN.map((stap, index) => (
              <Checkbox key={stap} label={stap} defaultChecked={index < 2} />
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel>
          <SectionHeader size="sm" tone="amber" title="Vorige bezoek" />
          <p style={{ fontSize: 12.5, lineHeight: 1.6 }}>
            16 jan 2026 — IOP 18/17 mmHg, geen progressie. Controle na 3 maanden afgesproken.
          </p>
        </WorkspacePanel>
      </WorkspaceRail>

      <WorkspaceMain>
        <Card>
          <CardContent>
            <SectionHeader title="Verslag" count="concept" divider />
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              De middenkolom houdt de volle breedte en blijft leesbaar; de rails ernaast scrollen mee tot
              ze vastklikken. Wordt dit werkblad smaller dan 980 px, dan stapelt alles: eerst deze kolom, daarna de rails.
            </p>
            <div style={{ height: 18 }} />
            <SectionHeader tone="blue" title="Metingen" count={4} />
            <RowList bordered>
              {[
                { naam: "Visus", od: "0.8", os: "0.9" },
                { naam: "IOP", od: "18 mmHg", os: "17 mmHg" },
                { naam: "Refractie", od: "-2.25", os: "-1.75" },
                { naam: "Pachymetrie", od: "545 µm", os: "551 µm" },
              ].map((rij) => (
                <ListRow
                  key={rij.naam}
                  title={rij.naam}
                  trailing={
                    <span style={{ display: "flex", gap: 14, fontVariantNumeric: "tabular-nums" }}>
                      <span>R {rij.od}</span>
                      <span>L {rij.os}</span>
                    </span>
                  }
                />
              ))}
            </RowList>
          </CardContent>
        </Card>
      </WorkspaceMain>

      <WorkspaceRail side="right">
        <WorkspacePanel>
          <SectionHeader size="sm" tone="green" title="Live" actions={<Badge tone="green" dot>verbonden</Badge>} />
          <Progress value={72} size="sm" label="Autorefractor" showValue />
        </WorkspacePanel>

        <WorkspacePanel>
          <SectionHeader size="sm" title="Snelle acties" />
          <div style={{ display: "grid", gap: 8 }}>
            <Button size="sm" variant="secondary" icon={<Icon name="plus" />} block>Meting</Button>
            <Button size="sm" variant="secondary" icon={<Icon name="file" />} block>Brief</Button>
            <Button size="sm" variant="secondary" icon={<Icon name="edit" />} block>Notitie</Button>
          </div>
        </WorkspacePanel>
      </WorkspaceRail>
    </Workspace>
  );
}
