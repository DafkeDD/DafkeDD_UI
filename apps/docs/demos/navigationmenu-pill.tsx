"use client";
import { useState } from "react";
import { Icon, NavigationMenu, NavigationMenuItem, NavigationMenuLink, Text } from "@dafke/ui";

export default function Demo() {
  const [actief, setActief] = useState("home");

  return (
    <div style={{ minHeight: 220, display: "grid", gap: 12, alignContent: "start" }}>
      <NavigationMenu indicator="hover" aria-label="Voorbeeldnavigatie">
        <NavigationMenuItem
          label="Start"
          href="#"
          active={actief === "home"}
          onClick={() => setActief("home")}
        />
        <NavigationMenuItem
          label="Over ons"
          href="#"
          active={actief === "over"}
          onClick={() => setActief("over")}
        />
        <NavigationMenuItem value="diensten" label="Diensten" active={actief === "diensten"}>
          <NavigationMenuLink href="#" title="Webdesign" description="Van schets tot oplevering" icon={<Icon name="layers" size={16} />} />
          <NavigationMenuLink href="#" title="Ontwikkeling" description="Maatwerk in React" icon={<Icon name="code" size={16} />} />
          <NavigationMenuLink href="#" title="Optimalisatie" description="Sneller en vindbaar" icon={<Icon name="chart" size={16} />} />
        </NavigationMenuItem>
        <NavigationMenuItem
          label="Contact"
          href="#"
          active={actief === "contact"}
          onClick={() => setActief("contact")}
        />
      </NavigationMenu>

      <Text variant="small" tone="muted">
        De pil volgt de muis en valt terug op het actieve item zodra je de balk
        verlaat. Met indicator=&quot;active&quot; blijft hij gewoon staan.
      </Text>
    </div>
  );
}
