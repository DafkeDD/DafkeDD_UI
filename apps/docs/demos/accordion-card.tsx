"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  Badge,
  Icon,
  Row,
  Text,
} from "@dafke/ui";

export default function Demo() {
  return (
    <Accordion variant="card" defaultValue={["overzicht"]} style={{ maxWidth: 460 }}>
      <AccordionItem value="overzicht">
        <AccordionTrigger
          icon={<Icon name="layers" size={16} />}
          description="Volledige projectdetails en inzichten"
        >
          Projectoverzicht
        </AccordionTrigger>
        <AccordionContent>
          <Text variant="small" tone="muted">
            Dit project levert een modern, schaalbaar scherm dat de ervaring
            verbetert en de prestaties opkrikt.
          </Text>
          <Row gap="sm" wrap style={{ marginTop: 10 }}>
            <Badge tone="green" size="sm">
              Hoge prioriteit
            </Badge>
            <Badge tone="accent" size="sm">
              Bezig
            </Badge>
            <Badge tone="neutral" size="sm">
              31 mei 2026
            </Badge>
          </Row>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="team">
        <AccordionTrigger
          icon={<Icon name="users" size={16} />}
          description="Beheer je teamleden"
        >
          Teamleden
        </AccordionTrigger>
        <AccordionContent>
          <Row gap="sm" align="center">
            {["Annelies", "Tom", "Sarah", "Mike"].map((naam) => (
              <Avatar key={naam} name={naam} size={28} />
            ))}
            <Text variant="small" tone="muted">
              4 leden
            </Text>
          </Row>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
