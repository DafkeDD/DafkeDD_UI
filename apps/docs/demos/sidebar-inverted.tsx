"use client";
import { useState } from "react";
import {
  AppShell, Avatar, Badge, Content, Icon, PageHeader, Sidebar, SidebarBrand, SidebarFooter,
  SidebarItem, SidebarNav, SidebarSection, ThemeToggle, Topbar, TopbarSpacer,
} from "@dafke/ui";

const LOCATIES = [
  { naam: "Zuiderzicht", sub: "Hoofdpraktijk" },
  { naam: "Noordkaai", sub: "Satelliet" },
];

export default function Demo() {
  const [actief, setActief] = useState("planning");
  const [locatie, setLocatie] = useState(0);

  return (
    <div style={{ height: 470, border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
      <AppShell style={{ minHeight: 0, height: "100%" }}>
        <Sidebar tone="inverted">
          <SidebarBrand logo={<Icon name="eye" />} name="OcuPlan" subtitle="Zuiderzicht" />

          <button
            type="button"
            className="lui-sidebar-panel"
            onClick={() => setLocatie((index) => (index + 1) % LOCATIES.length)}
          >
            <Icon name="globe" size={14} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="lui-sidebar-panel-title">{LOCATIES[locatie].naam}</span>
              <span className="lui-sidebar-panel-sub">{LOCATIES[locatie].sub}</span>
            </span>
            <Icon name="chevronsUpDown" size={13} />
          </button>

          <SidebarNav>
            <SidebarSection>Werk</SidebarSection>
            {[
              { key: "planning", label: "Planning", icon: "calendar" as const },
              { key: "verlof", label: "Verlof", icon: "sun" as const, badge: 3 },
              { key: "taken", label: "Taken", icon: "checkCircle" as const },
              { key: "documenten", label: "Documenten", icon: "file" as const },
            ].map((item) => (
              <SidebarItem
                key={item.key}
                icon={<Icon name={item.icon} />}
                badge={item.badge}
                active={actief === item.key}
                onClick={() => setActief(item.key)}
              >
                {item.label}
              </SidebarItem>
            ))}
          </SidebarNav>

          <SidebarFooter>
            <SidebarItem icon={<Icon name="settings" />} active={actief === "instellingen"} onClick={() => setActief("instellingen")}>
              Instellingen
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>

        <div className="lui-shell-main">
          <Topbar>
            <strong style={{ fontSize: 15, textTransform: "capitalize" }}>{actief}</strong>
            <TopbarSpacer />
            <Badge tone="amber" dot>3 aanvragen</Badge>
            <ThemeToggle size="sm" />
            <Avatar name="Julie Mertens" size={32} />
          </Topbar>
          <Content style={{ overflowY: "auto" }}>
            <PageHeader
              title="Weekplanning"
              description="De donkere rail gebruikt tokens die afgeleid zijn van het Dafke UI-accent — geen nieuwe kleuren."
            />
          </Content>
        </div>
      </AppShell>
    </div>
  );
}
