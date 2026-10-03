/** Basisgedrag van een aantal veelgebruikte componenten. */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../packages/ui/src/components/button";
import { Switch } from "../../packages/ui/src/components/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../packages/ui/src/components/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../packages/ui/src/components/accordion";

describe("Button", () => {
  it("roept onClick aan, maar niet als hij disabled is", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Opslaan</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Opslaan" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Button onClick={onClick} disabled>Opslaan</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Opslaan" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("rendert met asChild het kind-element in plaats van een button", () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.className).toContain("lui-btn");
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("Switch", () => {
  it("wisselt aria-checked en meldt de nieuwe waarde", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Meldingen" onCheckedChange={onCheckedChange} />);
    const knop = screen.getByRole("switch", { name: "Meldingen" });
    expect(knop.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(knop);
    expect(knop.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe("Tabs", () => {
  function Voorbeeld() {
    return (
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Eén</TabsTrigger>
          <TabsTrigger value="b">Twee</TabsTrigger>
          <TabsTrigger value="c">Drie</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Inhoud A</TabsContent>
        <TabsContent value="b">Inhoud B</TabsContent>
        <TabsContent value="c">Inhoud C</TabsContent>
      </Tabs>
    );
  }

  it("toont het actieve paneel en wisselt bij klikken", async () => {
    render(<Voorbeeld />);
    expect(screen.getByRole("tab", { name: "Eén" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Inhoud A")).toBeTruthy();
    await userEvent.click(screen.getByRole("tab", { name: "Twee" }));
    expect(screen.getByRole("tab", { name: "Twee" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Inhoud B")).toBeTruthy();
  });

  it("pijltje rechts gaat naar de volgende tab en loopt rond", () => {
    render(<Voorbeeld />);
    const lijst = screen.getByRole("tablist");
    screen.getByRole("tab", { name: "Drie" }).focus();
    fireEvent.keyDown(lijst, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Eén" }));
  });

  it("koppelt tab en paneel via aria-controls / aria-labelledby", () => {
    render(<Voorbeeld />);
    const tab = screen.getByRole("tab", { name: "Eén" });
    const paneel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(paneel.id);
    expect(paneel.getAttribute("aria-labelledby")).toBe(tab.id);
  });
});

describe("Accordion", () => {
  function Voorbeeld({ type }: { type: "single" | "multiple" }) {
    return (
      <Accordion type={type}>
        <AccordionItem value="1">
          <AccordionTrigger>Vraag 1</AccordionTrigger>
          <AccordionContent>Antwoord 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>Vraag 2</AccordionTrigger>
          <AccordionContent>Antwoord 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  const open = (naam: string) => screen.getByRole("button", { name: naam }).getAttribute("aria-expanded") === "true";

  it("single: er staat hoogstens één item open", async () => {
    render(<Voorbeeld type="single" />);
    await userEvent.click(screen.getByRole("button", { name: "Vraag 1" }));
    await userEvent.click(screen.getByRole("button", { name: "Vraag 2" }));
    expect(open("Vraag 1")).toBe(false);
    expect(open("Vraag 2")).toBe(true);
  });

  it("multiple: meerdere items tegelijk open", async () => {
    render(<Voorbeeld type="multiple" />);
    await userEvent.click(screen.getByRole("button", { name: "Vraag 1" }));
    await userEvent.click(screen.getByRole("button", { name: "Vraag 2" }));
    expect(open("Vraag 1")).toBe(true);
    expect(open("Vraag 2")).toBe(true);
  });
});
