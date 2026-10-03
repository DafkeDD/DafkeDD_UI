"use client";
import { Badge, Icon, Tabs, TabsContent, TabsList, TabsTrigger } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 30 }}>
      <Tabs defaultValue="overzicht">
        <TabsList>
          <TabsTrigger value="overzicht" icon={<Icon name="dashboard" />}>Overzicht</TabsTrigger>
          <TabsTrigger value="gebruikers" icon={<Icon name="users" />} badge={12}>Gebruikers</TabsTrigger>
          <TabsTrigger value="facturen" icon={<Icon name="euro" />}>Facturen</TabsTrigger>
          <TabsTrigger value="logs" disabled>Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overzicht">Kerncijfers en recente activiteit van deze tenant.</TabsContent>
        <TabsContent value="gebruikers">Twaalf gebruikers, waarvan drie beheerders.</TabsContent>
        <TabsContent value="facturen">Alle facturen van de laatste twaalf maanden.</TabsContent>
      </Tabs>

      <Tabs defaultValue="week" variant="pill">
        <TabsList>
          <TabsTrigger value="dag">Dag</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="maand">Maand</TabsTrigger>
        </TabsList>
        <TabsContent value="dag">Cijfers van vandaag.</TabsContent>
        <TabsContent value="week">Cijfers van deze week.</TabsContent>
        <TabsContent value="maand">Cijfers van deze maand.</TabsContent>
      </Tabs>

      <Tabs defaultValue="actief" variant="solid">
        <TabsList>
          <TabsTrigger value="actief">Actief</TabsTrigger>
          <TabsTrigger value="archief">Archief</TabsTrigger>
        </TabsList>
        <TabsContent value="actief">
          <Badge tone="green" dot>28 actieve tenants</Badge>
        </TabsContent>
        <TabsContent value="archief">
          <Badge dot>4 gearchiveerd</Badge>
        </TabsContent>
      </Tabs>
    </div>
  );
}
