"use client";
import {
  Icon, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ maxWidth: 340 }}>
      <Select defaultValue="vault">
        <SelectTrigger>
          <SelectValue placeholder="Kies een app" />
        </SelectTrigger>
        <SelectContent searchable searchPlaceholder="Zoek een app…">
          <SelectGroup>
            <SelectLabel>Beveiliging</SelectLabel>
            <SelectItem value="vault" icon={<Icon name="lock" size={16} />} description="Documenten en certificaten">
              Vault
            </SelectItem>
            <SelectItem value="shield" icon={<Icon name="shield" size={16} />} description="Toegangsbeheer">
              Access
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Administratie</SelectLabel>
            <SelectItem value="invoices" icon={<Icon name="euro" size={16} />} description="Facturen en abonnementen">
              Facturatie
            </SelectItem>
            <SelectItem value="tickets" icon={<Icon name="ticket" size={16} />} description="Support en meldingen">
              Tickets
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
