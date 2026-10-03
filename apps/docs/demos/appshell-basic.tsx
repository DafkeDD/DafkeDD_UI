"use client";
import { useState } from "react";
import {
  AppShell, Avatar, Badge, Content, Icon, PageHeader, Sidebar, SidebarBrand, SidebarFooter, SidebarItem,
  SidebarNav, SidebarSection, Topbar, TopbarSpacer,
} from "@dafke/ui";

export default function Demo() {
  const [actief, setActief] = useState("tenants");

  return (
    <div style={{ height: 460, border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
      <AppShell style={{ minHeight: 0, height: "100%" }}>
        <Sidebar>
          <SidebarBrand logo={<Icon name="shield" />} name="Dafke" subtitle="Superadmin" />
          <SidebarNav>
            <SidebarSection>Platform</SidebarSection>
            {[
              { key: "stats", label: "Statistieken", icon: "chart" as const },
              { key: "tenants", label: "Tenants", icon: "building" as const, badge: 28 },
              { key: "gebruikers", label: "Gebruikers", icon: "users" as const },
            ].map((item) => (
              <SidebarItem
                key={item.key}
                icon={<Icon name={item.icon} />}
                active={actief === item.key}
                badge={item.badge}
                onClick={() => setActief(item.key)}
              >
                {item.label}
              </SidebarItem>
            ))}
            <SidebarSection>Support</SidebarSection>
            <SidebarItem icon={<Icon name="ticket" />} badge={3} active={actief === "tickets"} onClick={() => setActief("tickets")}>
              Tickets
            </SidebarItem>
          </SidebarNav>
          <SidebarFooter>
            <SidebarItem icon={<Icon name="settings" />} active={actief === "settings"} onClick={() => setActief("settings")}>
              Instellingen
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>

        <div className="lui-shell-main">
          <Topbar>
            <strong style={{ fontSize: 15 }}>Tenants</strong>
            <TopbarSpacer />
            <Badge tone="green" dot>Live</Badge>
            <Avatar name="Davey Verhoeven" size={32} />
          </Topbar>
          <Content style={{ overflowY: "auto" }}>
            <PageHeader title="Tenants" description="Alle organisaties op het platform." />
            <p style={{ fontSize: 14 }}>Actieve sectie: <strong>{actief}</strong></p>
          </Content>
        </div>
      </AppShell>
    </div>
  );
}
