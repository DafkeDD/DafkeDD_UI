"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Accordion defaultValue={["facturatie"]}>
        <AccordionItem value="facturatie">
          <AccordionTrigger icon={<Icon name="euro" size={17} />}>Hoe werkt de facturatie?</AccordionTrigger>
          <AccordionContent>
            Elke tenant krijgt op de eerste werkdag van de maand automatisch een factuur voor het aantal actieve licenties.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="licenties">
          <AccordionTrigger icon={<Icon name="key" size={17} />}>Kan ik licenties tussentijds aanpassen?</AccordionTrigger>
          <AccordionContent>
            Ja. Bijgekochte licenties worden pro rata verrekend; opgezegde licenties lopen tot het einde van de periode.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="vault">
          <AccordionTrigger icon={<Icon name="lock" size={17} />}>Waar staan de documenten in de Vault?</AccordionTrigger>
          <AccordionContent>Versleuteld opgeslagen binnen de EU, met een aparte sleutel per tenant.</AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="multiple" variant="separated" defaultValue={["a"]}>
        <AccordionItem value="a">
          <AccordionTrigger>Meervoudig — item A</AccordionTrigger>
          <AccordionContent>Met `type="multiple"` kunnen meerdere items tegelijk open staan.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Meervoudig — item B</AccordionTrigger>
          <AccordionContent>En deze dus ook.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
