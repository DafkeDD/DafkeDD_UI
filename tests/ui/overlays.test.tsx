/**
 * Dialog, AlertDialog, ConfirmProvider en DropdownMenu.
 *
 * `it.fails(...)` = BEKENDE BUG (zie verbeterplan). Slaagt zolang de bug er is;
 * na de fix faalt hij — vervang dan `it.fails` door `it`.
 */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../packages/ui/src/components/dialog";
import { AlertDialog, ConfirmProvider, useConfirm } from "../../packages/ui/src/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "../../packages/ui/src/components/dropdown-menu";

/** Laat de exit-animatie (vangnet-timer) aflopen. */
const naAnimatie = () => act(() => new Promise((r) => setTimeout(r, 400)));

function VoorbeeldDialog({ description = true }: { description?: boolean }) {
  return (
    <>
      <button>ervoor</button>
      <Dialog>
        <DialogTrigger>Openen</DialogTrigger>
        <DialogContent>
          <DialogTitle>Afspraak</DialogTitle>
          {description && <DialogDescription>Details van de afspraak</DialogDescription>}
          <input aria-label="Naam" />
          <DialogClose>Klaar</DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("opent via de trigger en heeft een toegankelijke naam en beschrijving", async () => {
    render(<VoorbeeldDialog />);
    await userEvent.click(screen.getByText("Openen"));
    const dialog = await screen.findByRole("dialog", { name: "Afspraak" });
    expect(dialog).toHaveProperty("ariaModal", "true");
    expect(dialog.getAttribute("aria-describedby")).toBe(screen.getByText("Details van de afspraak").id);
  });

  it("sluit met DialogClose, het kruisje en Escape", async () => {
    render(<VoorbeeldDialog />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Openen"));
    await user.click(await screen.findByText("Klaar"));
    await naAnimatie();
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByText("Openen"));
    await user.click(await screen.findByLabelText("Sluiten"));
    await naAnimatie();
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByText("Openen"));
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    await naAnimatie();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sluit bij een klik op de overlay, maar niet met `static`", async () => {
    const { rerender } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const overlay = (await screen.findByRole("dialog")).closest(".lui-overlay")!;
    fireEvent.mouseDown(overlay);
    await naAnimatie();
    expect(screen.queryByRole("dialog")).toBeNull();

    rerender(
      <Dialog open>
        <DialogContent static>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const overlay2 = (await screen.findByRole("dialog")).closest(".lui-overlay")!;
    fireEvent.mouseDown(overlay2);
    await naAnimatie();
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("blokkeert het scrollen van de pagina zolang hij open is", async () => {
    render(<VoorbeeldDialog />);
    await userEvent.click(screen.getByText("Openen"));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    await naAnimatie();
    expect(document.body.style.overflow).toBe("");
  });

  it.fails("BEKENDE BUG: bij openen staat de focus in de dialog", async () => {
    render(<VoorbeeldDialog />);
    await userEvent.click(screen.getByText("Openen"));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true), { timeout: 300 });
  });

  it.fails("BEKENDE BUG: Tab blijft binnen de dialog (focus-trap)", async () => {
    render(<VoorbeeldDialog />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Openen"));
    const dialog = await screen.findByRole("dialog");
    screen.getByText("Klaar").focus();
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it.fails("BEKENDE BUG: na sluiten keert de focus terug naar de trigger", async () => {
    render(<VoorbeeldDialog />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Openen"));
    await screen.findByRole("dialog");
    await user.click(screen.getByLabelText("Naam")); // focus zit nu in de dialog
    fireEvent.keyDown(document, { key: "Escape" });
    await naAnimatie();
    expect(document.activeElement).toBe(screen.getByText("Openen"));
  });

  it.fails("BEKENDE BUG: zonder DialogDescription verwijst aria-describedby niet naar een onbestaand id", async () => {
    render(<VoorbeeldDialog description={false} />);
    await userEvent.click(screen.getByText("Openen"));
    const dialog = await screen.findByRole("dialog");
    const id = dialog.getAttribute("aria-describedby");
    expect(id === null || document.getElementById(id) !== null).toBe(true);
  });
});

describe("AlertDialog", () => {
  it("roept onConfirm en onCancel aan en sluit daarna", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <AlertDialog defaultOpen title="Verwijderen?" onConfirm={onConfirm} onCancel={onCancel} />
    );
    await user.click(await screen.findByText("Bevestigen"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await naAnimatie();
    expect(screen.queryByRole("alertdialog")).toBeNull();

    rerender(<AlertDialog key="2" defaultOpen title="Verwijderen?" onConfirm={onConfirm} onCancel={onCancel} />);
    await user.click(await screen.findByText("Annuleren"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("zet de focus op Annuleren (veilige keuze)", async () => {
    render(<AlertDialog defaultOpen title="Verwijderen?" />);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText("Annuleren").closest("button")));
  });

  it.fails("BEKENDE BUG: heeft de titel als toegankelijke naam", async () => {
    render(<AlertDialog defaultOpen title="Verwijderen?" />);
    expect(await screen.findByRole("alertdialog", { name: "Verwijderen?" })).toBeTruthy();
  });
});

describe("ConfirmProvider / useConfirm", () => {
  function Knop({ onAntwoord }: { onAntwoord: (v: boolean) => void }) {
    const confirm = useConfirm();
    return <button onClick={async () => onAntwoord(await confirm({ title: "Zeker?" }))}>Vraag</button>;
  }

  it("geeft true bij bevestigen en false bij annuleren", async () => {
    const onAntwoord = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmProvider>
        <Knop onAntwoord={onAntwoord} />
      </ConfirmProvider>
    );
    await user.click(screen.getByText("Vraag"));
    await user.click(await screen.findByText("Bevestigen"));
    await waitFor(() => expect(onAntwoord).toHaveBeenLastCalledWith(true));

    await naAnimatie();
    await user.click(screen.getByText("Vraag"));
    await user.click(await screen.findByText("Annuleren"));
    await waitFor(() => expect(onAntwoord).toHaveBeenLastCalledWith(false));
  });

  it("gooit een duidelijke fout zonder provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function ZonderProvider() {
      useConfirm();
      return null;
    }
    expect(() => render(<ZonderProvider />)).toThrow(/ConfirmProvider/);
  });

  it.fails("BEKENDE BUG: een tweede confirm() laat de eerste promise niet eeuwig hangen", async () => {
    let confirm!: ReturnType<typeof useConfirm>;
    function Vang() {
      confirm = useConfirm();
      return null;
    }
    render(
      <ConfirmProvider>
        <Vang />
      </ConfirmProvider>
    );
    let eerste: boolean | "hangt" = "hangt";
    act(() => {
      confirm({ title: "Eerste" }).then((v) => (eerste = v));
    });
    act(() => {
      confirm({ title: "Tweede" });
    });
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(eerste).not.toBe("hangt");
  });
});

describe("DropdownMenu", () => {
  function Menu({ onKies = () => {} }: { onKies?: (v: string) => void }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>Acties</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onKies("bewerken")}>Bewerken</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onKies("kopiëren")}>Kopiëren</DropdownMenuItem>
          <DropdownMenuItem disabled onClick={() => onKies("uit")}>Uitgeschakeld</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it("opent, voert een item uit en sluit", async () => {
    const onKies = vi.fn();
    const user = userEvent.setup();
    render(<Menu onKies={onKies} />);
    await user.click(screen.getByText("Acties"));
    expect(await screen.findByRole("menu")).toBeTruthy();
    await user.click(screen.getByText("Kopiëren"));
    expect(onKies).toHaveBeenCalledWith("kopiëren");
    await naAnimatie();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("negeert uitgeschakelde items", async () => {
    const onKies = vi.fn();
    render(<Menu onKies={onKies} />);
    await userEvent.click(screen.getByText("Acties"));
    fireEvent.click(await screen.findByText("Uitgeschakeld"));
    expect(onKies).not.toHaveBeenCalled();
  });

  it("pijltjestoetsen verplaatsen de focus tussen de items", async () => {
    render(<Menu />);
    await userEvent.click(screen.getByText("Acties"));
    const menu = await screen.findByRole("menu");
    const items = screen.getAllByRole("menuitem").filter((item) => !(item as HTMLButtonElement).disabled);
    items[0].focus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(menu, { key: "End" });
    expect(document.activeElement).toBe(items[items.length - 1]);
    fireEvent.keyDown(menu, { key: "Home" });
    expect(document.activeElement).toBe(items[0]);
  });

  it.fails("BEKENDE BUG: bij openen krijgt het eerste item de focus", async () => {
    render(<Menu />);
    await userEvent.click(screen.getByText("Acties"));
    await screen.findByRole("menu");
    await waitFor(() => expect(document.activeElement).toBe(screen.getAllByRole("menuitem")[0]), { timeout: 300 });
  });

  it.fails("BEKENDE BUG: een eigen onClick op een CheckboxItem breekt het aanvinken niet", async () => {
    const onCheckedChange = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Kolommen</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange} onClick={() => {}}>
            Naam
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.click(await screen.findByText("Naam"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it.fails("BEKENDE BUG: Escape in een menu binnen een dialog sluit alleen het menu", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Met menu</DialogTitle>
          <Menu />
        </DialogContent>
      </Dialog>
    );
    await userEvent.click(await screen.findByText("Acties"));
    await screen.findByRole("menu");
    fireEvent.keyDown(document, { key: "Escape" });
    await naAnimatie();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });
});
