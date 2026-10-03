"use client";
import {
  Avatar, Badge, Button, EntityHeader, Icon, Tabs, TabsList, TabsTrigger,
} from "@dafke/ui";

export default function Demo() {
  return (
    <div>
      <EntityHeader
        media={<Avatar name="Lisa Vanreppelen" size={56} />}
        title="Lisa Vanreppelen"
        titleSuffix="· V, 68j"
        meta="12-03-1958 · RRN 58.03.12-244.61 · GMD Dr. S. Janssens"
        tags={
          <>
            <Badge tone="red" dot>Diabetes type 2</Badge>
            <Badge tone="amber" dot>Allergie: penicilline</Badge>
            <Badge tone="blue">Retinopathie</Badge>
            <Badge tone="neutral">Bril sinds 2019</Badge>
          </>
        }
        details={[
          { icon: <Icon name="phone" />, label: "+32 476 21 33 08", onClick: () => undefined },
          { icon: <Icon name="mail" />, label: "l.vanreppelen@telenet.be", onClick: () => undefined },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Icon name="calendar" />}>Agenda</Button>
            <Button variant="secondary" icon={<Icon name="file" />}>Afdrukken</Button>
            <Button icon={<Icon name="plus" />}>Nieuwe consultatie</Button>
          </>
        }
      />

      <Tabs defaultValue="samenvatting">
        <TabsList>
          <TabsTrigger value="samenvatting">Samenvatting</TabsTrigger>
          <TabsTrigger value="consultaties" badge={47}>Consultaties</TabsTrigger>
          <TabsTrigger value="metingen">Metingen</TabsTrigger>
          <TabsTrigger value="beelden" badge={124}>Beelden</TabsTrigger>
          <TabsTrigger value="medicatie" badge={3}>Medicatie</TabsTrigger>
          <TabsTrigger value="documenten" badge={35}>Documenten</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
