"use client";
import { useState } from "react";
import { DropdownMenuItem, DropdownMenuSeparator, Icon, Row, SplitButton, Text } from "@dafke/ui";

export default function Demo() {
  const [laatste, setLaatste] = useState("—");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Row gap="md" wrap align="center">
        <SplitButton
          icon={<Icon name="send" size={15} />}
          onAction={() => setLaatste("Verstuurd")}
          menu={
            <>
              <DropdownMenuItem icon={<Icon name="clock" size={15} />} onClick={() => setLaatste("Ingepland")}>
                Later versturen
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Icon name="file" size={15} />} onClick={() => setLaatste("Concept bewaard")}>
                Als concept bewaren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                icon={<Icon name="trash" size={15} />}
                destructive
                onClick={() => setLaatste("Verwijderd")}
              >
                Verwijderen
              </DropdownMenuItem>
            </>
          }
        >
          Versturen
        </SplitButton>

        <SplitButton
          variant="secondary"
          icon={<Icon name="download" size={15} />}
          onAction={() => setLaatste("PDF gedownload")}
          menu={
            <>
              <DropdownMenuItem onClick={() => setLaatste("CSV gedownload")}>Als CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLaatste("Excel gedownload")}>Als Excel</DropdownMenuItem>
            </>
          }
        >
          Exporteren
        </SplitButton>
      </Row>

      <Text variant="small" tone="muted">
        Laatste actie: {laatste}
      </Text>
    </div>
  );
}
