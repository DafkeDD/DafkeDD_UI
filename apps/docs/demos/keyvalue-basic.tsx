"use client";
import { Badge, Card, CardContent, Icon, KeyValue, KeyValueList, Text } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      <Card>
        <CardContent>
          <Text variant="h3" style={{ marginBottom: 14 }}>Horizontaal</Text>
          <KeyValueList horizontal divided>
            <KeyValue label="Rijksregisternummer">85.07.14-123.45</KeyValue>
            <KeyValue label="Huisarts" icon={<Icon name="user" size={14} />}>Dr. Reyniers</KeyValue>
            <KeyValue label="Mutualiteit">CM Zorgkas</KeyValue>
            <KeyValue label="Laatste consultatie">14 maart 2026</KeyValue>
            <KeyValue label="Opmerking" />
          </KeyValueList>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Text variant="h3" style={{ marginBottom: 14 }}>Onder elkaar, twee kolommen</Text>
          <KeyValueList columns={2}>
            <KeyValue label="Status"><Badge tone="green">Actief</Badge></KeyValue>
            <KeyValue label="Dossiernummer">D-2026-0481</KeyValue>
            <KeyValue label="Telefoon">+32 476 21 33 08</KeyValue>
            <KeyValue label="E-mail" truncate>annelies.peeters@voorbeeld.be</KeyValue>
          </KeyValueList>
        </CardContent>
      </Card>
    </div>
  );
}
