"use client";
import { Button, Field, Icon, Input, Popover, PopoverContent, PopoverTrigger } from "@dafke/ui";

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" icon={<Icon name="filter" />}>Filter</Button>
      </PopoverTrigger>
      <PopoverContent align="start" style={{ width: 280 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="Zoekterm">
            <Input size="sm" placeholder="Naam of nummer" />
          </Field>
          <Field label="Minimum aantal seats">
            <Input size="sm" type="number" defaultValue={10} />
          </Field>
          <Button size="sm" block>Toepassen</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
