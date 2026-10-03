"use client";
import {
  Icon,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuSection,
} from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ minHeight: 320 }}>
      <NavigationMenu aria-label="Hoofdnavigatie">
        <NavigationMenuItem value="producten" label="Producten" mega>
          <NavigationMenuSection label="Platform">
            <NavigationMenuLink
              href="#"
              title="Componenten"
              description="204 bouwstenen, klaar om te kopiëren."
              icon={<Icon name="layers" size={16} />}
            />
            <NavigationMenuLink
              href="#"
              title="Thema's"
              description="Tokens voor licht, donker en dichtheid."
              icon={<Icon name="sun" size={16} />}
            />
          </NavigationMenuSection>
          <NavigationMenuSection label="Tools">
            <NavigationMenuLink
              href="#"
              title="CLI"
              description="dafke-ui add button"
              icon={<Icon name="terminal" size={16} />}
            />
            <NavigationMenuLink
              href="#"
              title="Registry"
              description="Eén JSON per component."
              icon={<Icon name="box" size={16} />}
            />
          </NavigationMenuSection>
        </NavigationMenuItem>

        <NavigationMenuItem value="oplossingen" label="Oplossingen">
          <NavigationMenuLink href="#" title="Zorg" description="Planning, dossiers en intake." />
          <NavigationMenuLink href="#" title="Retail" description="Kassa, voorraad en bestellingen." />
          <NavigationMenuLink href="#" title="Intern" description="Dashboards en beheerschermen." />
        </NavigationMenuItem>

        <NavigationMenuItem label="Prijzen" href="#" />
        <NavigationMenuItem label="Documentatie" href="#" active />
      </NavigationMenu>
    </div>
  );
}
