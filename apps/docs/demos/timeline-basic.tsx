"use client";
import { Badge, Icon, Timeline, TimelineItem } from "@dafke/ui";

export default function Demo() {
  return (
    <Timeline style={{ width: "100%", maxWidth: 460 }}>
      <TimelineItem
        tone="green"
        icon={<Icon name="check" />}
        title="Dossier aangemaakt"
        time="20 mrt · 09:12"
        by="Espeel Léonie"
      />
      <TimelineItem
        tone="accent"
        icon={<Icon name="idcard" />}
        title="eID uitgelezen"
        time="20 mrt · 09:14"
        by="Espeel Léonie"
      >
        Rijksregisternummer en adres automatisch overgenomen.
      </TimelineItem>
      <TimelineItem
        tone="amber"
        icon={<Icon name="alert" />}
        title="Allergie toegevoegd"
        time="20 mrt · 09:31"
        by="dr. Vermeulen"
      >
        Penicilline — <Badge tone="red" size="sm">kritiek</Badge>
      </TimelineItem>
      <TimelineItem
        active
        tone="accent"
        icon={<Icon name="clock" />}
        title="Wacht op resultaten labo"
        time="vandaag · 11:05"
        by="dr. Vermeulen"
        pending
      />
      <TimelineItem tone="neutral" title="Nacontrole ingepland" time="over 6 weken" pending />
    </Timeline>
  );
}
