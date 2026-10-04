/** De eID-componenten: props-gestuurd, zonder @dafkedd/eid. */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EidStatus } from "../../packages/ui/src/components/eid-status";
import { EidCard, type EidCardIdentity } from "../../packages/ui/src/components/eid-card";
import { EidPinDialog } from "../../packages/ui/src/components/eid-pin-dialog";
import { EidReaderPicker } from "../../packages/ui/src/components/eid-reader-picker";

const identity: EidCardIdentity = {
  firstNames: "Lotte",
  lastName: "Peeters",
  nationalNumber: "90020199705",
  dateOfBirth: { year: 1990, month: 2, day: 1 },
  placeOfBirth: "Gent",
  gender: "female",
  cardNumber: "592123456789",
  validUntil: "2031-05-14",
};
const address = { streetAndNumber: "Veldstraat 12", zipCode: "9000", municipality: "Gent" };

describe("EidStatus", () => {
  it("toont downloadlinks als de bridge ontbreekt", () => {
    render(<EidStatus phase="no-bridge" downloads={{ windows: "/dl/win.exe", mac: "/dl/mac" }} />);
    expect(screen.getByRole("status").dataset.phase).toBe("no-bridge");
    expect(screen.getByRole("link", { name: /Downloaden voor Windows/ }).getAttribute("href")).toBe("/dl/win.exe");
    expect(screen.getByRole("link", { name: /Downloaden voor macOS/ })).toBeTruthy();
  });

  it("spreekt van bijwerken bij een verouderde bridge en laat lege links weg", () => {
    render(<EidStatus phase="bridge-outdated" downloads={{ windows: "/dl/win.exe" }} />);
    expect(screen.getByRole("link", { name: /Bijwerken voor Windows/ })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /macOS/ })).toBeNull();
  });

  it("toont geen downloads in andere fases", () => {
    render(<EidStatus phase="no-card" downloads={{ windows: "/dl/win.exe" }} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("roept onRead aan bij ready en bij een fout, met de foutmelding", async () => {
    const onRead = vi.fn();
    const { rerender } = render(<EidStatus phase="ready" onRead={onRead} />);
    await userEvent.click(screen.getByRole("button", { name: "Kaart lezen" }));
    rerender(<EidStatus phase="error" error={{ message: "Kaart verwijderd" }} onRead={onRead} />);
    expect(screen.getByText("Kaart verwijderd")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Opnieuw" }));
    expect(onRead).toHaveBeenCalledTimes(2);
  });

  it("is aria-busy tijdens het lezen en compact zonder knoppen", () => {
    render(<EidStatus phase="reading" compact onRead={() => {}} reader="Lezer 0" />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("Lezer 0")).toBeNull();
  });

  it("neemt eigen teksten over", () => {
    render(<EidStatus phase="no-card" labels={{ "no-card": { title: "Insert your card" } }} />);
    expect(screen.getByText("Insert your card")).toBeTruthy();
  });
});

describe("EidCard", () => {
  it("schermt gevoelige velden standaard af", () => {
    const { container } = render(<EidCard identity={identity} address={address} />);
    const tekst = container.textContent ?? "";
    expect(tekst).toContain("Lotte Peeters");
    expect(tekst).not.toContain("90.02.01-997.05");
    expect(tekst).toContain("••.••.••-•••.05");
    expect(tekst).not.toContain("Veldstraat");
    expect(tekst).toContain("9000 Gent");
    expect(tekst).not.toContain("592-1234567-89");
    expect(tekst).toContain("1990");
    expect(tekst).not.toContain("Gent" + " ") ; // geen geboorteplaats-suffix
    expect(tekst).not.toMatch(/in Gent/);
  });

  it("toont alles na een klik en meldt de wissel", async () => {
    const onMaskedChange = vi.fn();
    const { container } = render(<EidCard identity={identity} address={address} onMaskedChange={onMaskedChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Toon alles" }));
    const tekst = container.textContent ?? "";
    expect(tekst).toContain("90.02.01-997.05");
    expect(tekst).toContain("Veldstraat 12");
    expect(tekst).toContain("592-1234567-89");
    expect(tekst).toMatch(/in Gent/);
    expect(onMaskedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Afschermen" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("maakt een data-URL van de foto-bytes en vervaagt ze afgeschermd", () => {
    render(<EidCard identity={identity} photo={{ mimeType: "image/jpeg", data: new Uint8Array([0xff, 0xd8, 0xff]) }} />);
    const img = screen.getByRole("img", { name: "Foto van Lotte Peeters" });
    expect(img.getAttribute("src")).toBe("data:image/jpeg;base64,/9j/");
    expect(img.hasAttribute("data-blurred")).toBe(true);
  });

  it("verbergt de knop met revealable={false}", () => {
    render(<EidCard identity={identity} revealable={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("EidPinDialog", () => {
  const pinVeld = () => screen.getByLabelText("PIN-code") as HTMLInputElement;

  it("verstuurt de PIN en maakt het veld daarna leeg", async () => {
    const onSubmit = vi.fn();
    render(<EidPinDialog open onSubmit={onSubmit} />);
    const knop = screen.getByRole("button", { name: "Aanmelden" }) as HTMLButtonElement;
    await userEvent.type(pinVeld(), "12a3");
    expect(pinVeld().value).toBe("123");
    expect(knop.disabled).toBe(true);
    await userEvent.type(pinVeld(), "4");
    await userEvent.click(knop);
    expect(onSubmit).toHaveBeenCalledWith("1234");
    expect(pinVeld().value).toBe("");
  });

  it("is een wachtwoordveld zonder autocomplete", () => {
    render(<EidPinDialog open onSubmit={() => {}} />);
    expect(pinVeld().type).toBe("password");
    expect(pinVeld().getAttribute("autocomplete")).toBe("off");
  });

  it("toont de resterende pogingen bij een verkeerde PIN", () => {
    const { rerender } = render(
      <EidPinDialog open onSubmit={() => {}} status="error" error={{ code: "pin-incorrect", message: "x" }} triesLeft={2} />
    );
    expect(screen.getByRole("alert").textContent).toContain("Nog 2 pogingen");
    rerender(<EidPinDialog open onSubmit={() => {}} status="error" error={{ code: "pin-incorrect", message: "x" }} triesLeft={1} />);
    expect(screen.getByRole("alert").textContent).toContain("Nog 1 poging, daarna");
  });

  it("vergrendelt bij een geblokkeerde PIN", () => {
    render(<EidPinDialog open onSubmit={() => {}} status="error" error={{ code: "pin-blocked", message: "x" }} />);
    expect(screen.getByRole("alert").textContent).toContain("geblokkeerd");
    expect(pinVeld().disabled).toBe(true);
  });

  it("kan tijdens het ondertekenen niet sluiten", async () => {
    const onOpenChange = vi.fn();
    render(<EidPinDialog open onOpenChange={onOpenChange} onSubmit={() => {}} status="signing" />);
    const dialoog = screen.getByRole("dialog");
    expect(within(dialoog).queryByRole("button", { name: "Sluiten" })).toBeNull();
    expect((screen.getByRole("button", { name: "Annuleren" }) as HTMLButtonElement).disabled).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("annuleren sluit het venster", async () => {
    const onOpenChange = vi.fn();
    render(<EidPinDialog open onOpenChange={onOpenChange} onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Annuleren" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("EidReaderPicker", () => {
  const readers = [
    { name: "Lezer A", cardPresent: true },
    { name: "Lezer B", cardPresent: false },
  ];

  it("toont per lezer of er een kaart in zit en meldt de keuze", async () => {
    const onValueChange = vi.fn();
    render(<EidReaderPicker readers={readers} value="Lezer A" onValueChange={onValueChange} />);
    expect(screen.getByText("Kaart aanwezig")).toBeTruthy();
    expect(screen.getByText("Geen kaart")).toBeTruthy();
    await userEvent.click(screen.getByRole("radio", { name: /Lezer B/ }));
    expect(onValueChange).toHaveBeenCalledWith("Lezer B");
  });

  it("maakt lezers zonder kaart onkiesbaar met requireCard", () => {
    render(<EidReaderPicker readers={readers} requireCard />);
    expect((screen.getByRole("radio", { name: /Lezer B/ }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("radio", { name: /Lezer A/ }) as HTMLInputElement).disabled).toBe(false);
  });

  it("toont een lege staat zonder lezers", () => {
    render(<EidReaderPicker readers={[]} />);
    expect(screen.getByText("Geen kaartlezer gevonden.")).toBeTruthy();
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });
});
