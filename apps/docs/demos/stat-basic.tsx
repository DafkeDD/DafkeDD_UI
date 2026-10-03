"use client";
import { Icon, Sparkline, Stat, StatGrid } from "@dafke/ui";

export default function Demo() {
  return (
    <StatGrid>
      <Stat
        label="Actieve tenants"
        value="284"
        icon={<Icon name="building" />}
        delta={12.4}
        deltaLabel="vs. vorige maand"
      />
      <Stat
        label="Maandelijkse omzet"
        value="€ 48.320"
        tone="green"
        icon={<Icon name="euro" />}
        delta={4.1}
        chart={<Sparkline data={[12, 18, 15, 22, 26, 24, 31]} height={34} color="var(--green)" />}
      />
      <Stat label="Open tickets" value="17" tone="amber" icon={<Icon name="ticket" />} delta={-8.2} />
      <Stat label="Licenties in gebruik" value="1.842" tone="violet" icon={<Icon name="key" />} />
    </StatGrid>
  );
}
