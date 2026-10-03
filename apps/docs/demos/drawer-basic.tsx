"use client";
import {
  Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader,
  DrawerTitle, DrawerTrigger,
} from "@dafke/ui";

type Side = "left" | "right" | "top" | "bottom";

export default function Demo() {
  return (
    <>
      {(["left", "right", "top", "bottom"] as Side[]).map((option) => (
        <Drawer key={option}>
          <DrawerTrigger asChild>
            <Button variant="secondary">{option}</Button>
          </DrawerTrigger>
          <DrawerContent side={option}>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Verfijn de lijst met tenants.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              Het paneel schuift in vanaf <strong>{option}</strong>. Escape sluit, focus blijft binnen het paneel.
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost">Sluiten</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button>Toepassen</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </>
  );
}
