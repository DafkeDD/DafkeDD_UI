"use client";
import { useMemo, useState } from "react";
import {
  Avatar, Badge, Button, Icon, Input, Pagination, Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow, TableToolbar,
} from "@dafke/ui";

const RIJEN = [
  { naam: "ITWORXS BV", contact: "Davey Verhoeven", seats: 24, status: "actief", bedrag: 696 },
  { naam: "Dafke NV", contact: "Ilse Peeters", seats: 112, status: "actief", bedrag: 3248 },
  { naam: "Delta Solutions", contact: "Karim Aznar", seats: 8, status: "proef", bedrag: 0 },
  { naam: "Noord Logistiek", contact: "Sofie Claes", seats: 46, status: "achterstallig", bedrag: 1334 },
];

const TONEN = { actief: "green", proef: "blue", achterstallig: "red" } as const;

export default function Demo() {
  const [sort, setSort] = useState<{ key: "naam" | "seats" | "bedrag"; dir: "asc" | "desc" }>({ key: "seats", dir: "desc" });
  const [query, setQuery] = useState("");

  const rijen = useMemo(() => {
    const filtered = RIJEN.filter((rij) => rij.naam.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => {
      const factor = sort.dir === "asc" ? 1 : -1;
      const left = a[sort.key];
      const right = b[sort.key];
      return typeof left === "string" ? left.localeCompare(right as string) * factor : ((left as number) - (right as number)) * factor;
    });
  }, [sort, query]);

  const toggle = (key: "naam" | "seats" | "bedrag") =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }));

  return (
    <div>
      <TableToolbar>
        <Input
          size="sm"
          prefix={<Icon name="search" />}
          placeholder="Zoek een tenant…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ maxWidth: 260 }}
        />
        <Button size="sm" variant="secondary" icon={<Icon name="download" />}>Exporteren</Button>
      </TableToolbar>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sorted={sort.key === "naam" && sort.dir} onClick={() => toggle("naam")}>Tenant</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead sortable sorted={sort.key === "seats" && sort.dir} onClick={() => toggle("seats")} align="right">Seats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead sortable sorted={sort.key === "bedrag" && sort.dir} onClick={() => toggle("bedrag")} align="right">Per maand</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rijen.map((rij) => (
            <TableRow key={rij.naam} clickable>
              <TableCell strong>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={rij.naam} size={28} square />
                  {rij.naam}
                </span>
              </TableCell>
              <TableCell>{rij.contact}</TableCell>
              <TableCell align="right">{rij.seats}</TableCell>
              <TableCell>
                <Badge tone={TONEN[rij.status as keyof typeof TONEN]} dot>{rij.status}</Badge>
              </TableCell>
              <TableCell align="right">€ {rij.bedrag.toLocaleString("nl-BE")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div style={{ marginTop: 16 }}>
        <Pagination page={1} pageCount={6} onPageChange={() => undefined} summary={`${rijen.length} van 240 tenants`} />
      </div>
    </div>
  );
}
