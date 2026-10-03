"use client";
import { useState } from "react";
import { Avatar, Composer, Message, MessageDay, MessageThread } from "@dafke/ui";

interface Bericht {
  id: number;
  from: "me" | "them" | "system";
  author?: string;
  time: string;
  tekst: string;
  internal?: boolean;
}

const START: Bericht[] = [
  { id: 1, from: "system", time: "09:02", tekst: "Ticket #2481 geopend — categorie: facturatie" },
  { id: 2, from: "them", author: "Praktijk Vermeulen", time: "09:03", tekst: "De factuur van maart klopt niet: er staan twee consultaties op terwijl er maar één was." },
  { id: 3, from: "me", author: "Support", time: "09:11", tekst: "Bedankt voor de melding, ik kijk het meteen na." },
  { id: 4, from: "me", author: "Support", time: "09:12", tekst: "Dubbele registratie gevonden op 12/03. Ik stuur een creditnota.", internal: true },
];

export default function Demo() {
  const [berichten, setBerichten] = useState(START);

  return (
    <div
      style={{
        width: "100%", maxWidth: 520, border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)", overflow: "hidden",
      }}
    >
      <MessageThread style={{ height: 320 }}>
        <MessageDay>Vandaag</MessageDay>
        {berichten.map((bericht) => (
          <Message
            key={bericht.id}
            from={bericht.from}
            author={bericht.from === "system" ? undefined : bericht.author}
            time={bericht.time}
            internal={bericht.internal}
            avatar={bericht.from === "them" ? <Avatar name={bericht.author} size={28} /> : undefined}
            status={bericht.id === berichten.length && bericht.from === "me" ? "verzonden" : undefined}
          >
            {bericht.tekst}
          </Message>
        ))}
      </MessageThread>

      <div style={{ borderTop: "1px solid var(--border)", padding: 10, background: "var(--surface)" }}>
        <Composer
          placeholder="Antwoord typen…"
          onSubmit={(waarde) =>
            setBerichten((vorige) => [
              ...vorige,
              {
                id: vorige.length + 1,
                from: "me",
                author: "Support",
                time: new Date().toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" }),
                tekst: waarde,
              },
            ])
          }
        />
      </div>
    </div>
  );
}
