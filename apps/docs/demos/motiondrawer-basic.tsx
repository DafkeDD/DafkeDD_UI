"use client";
import { useState } from "react";
import {
  Button, Drawer, DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, Icon,
  Segmented,
} from "@dafke/ui";
import { MotionDrawerContent } from "@dafke/ui/motion";

export default function Demo() {
  const [zijde, setZijde] = useState("right");

  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
      <Segmented
        size="sm"
        value={zijde}
        onValueChange={setZijde}
        options={[
          { value: "right", label: "Rechts" },
          { value: "left", label: "Links" },
          { value: "bottom", label: "Onder" },
        ]}
      />

      <Drawer>
        <DrawerTrigger asChild>
          <Button icon={<Icon name="layers" />}>Paneel openen</Button>
        </DrawerTrigger>
        <MotionDrawerContent side={zijde as "left" | "right" | "bottom"} handle={zijde === "bottom"}>
          <DrawerHeader>
            <DrawerTitle>Afspraak verplaatsen</DrawerTitle>
            <DrawerDescription>
              Sleep dit paneel naar de rand om het te sluiten — of gebruik Escape.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6 }}>
              Het paneel volgt je vinger en veert terug als je halverwege loslaat. Sleep je ver genoeg door,
              of laat je met snelheid los, dan gaat het dicht — met een echte uitgaande animatie in plaats van
              een harde verdwijning.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="secondary">Annuleren</Button>
            <Button>Bewaren</Button>
          </DrawerFooter>
        </MotionDrawerContent>
      </Drawer>
    </div>
  );
}
