"use client";
import { Button, EidCard, type EidCardIdentity } from "@dafke/ui";

// Verzonnen gegevens; het rijksregisternummer heeft een geldige controle.
const identity: EidCardIdentity = {
  firstNames: "Lotte Marie",
  lastName: "Peeters",
  nationalNumber: "90020199705",
  dateOfBirth: { year: 1990, month: 2, day: 1 },
  placeOfBirth: "Gent",
  gender: "female",
  nationality: "Belg",
  cardNumber: "592123456789",
  validUntil: "2031-05-14",
};

const address = { streetAndNumber: "Veldstraat 12 bus 3", zipCode: "9000", municipality: "Gent" };

export default function Demo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <EidCard identity={identity} address={address} />
      <EidCard
        identity={identity}
        address={address}
        defaultMasked={false}
        footer={
          <>
            <Button size="sm">Gegevens overnemen</Button>
            <Button size="sm" variant="ghost">Wissen</Button>
          </>
        }
      />
    </div>
  );
}
