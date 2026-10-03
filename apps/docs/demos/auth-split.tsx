"use client";
import { useState } from "react";
import {
  AuthCard,
  AuthDivider,
  AuthLayout,
  Button,
  Checkbox,
  Field,
  Icon,
  Input,
  SsoButton,
} from "@dafke/ui";

export default function Demo() {
  const [bezig, setBezig] = useState<string | null>(null);

  return (
    <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <AuthLayout
        style={{ minHeight: 560 }}
        aside={
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 17 }}>
              <Icon name="idcard" size={22} />
              Dafke
            </div>
            <div>
              <h2 style={{ fontSize: 30, lineHeight: 1.15, letterSpacing: "-0.03em", margin: 0 }}>
                Eén dossier,
                <br />
                heel de praktijk.
              </h2>
              <p style={{ marginTop: 14, fontSize: 15, opacity: 0.86, maxWidth: 320, lineHeight: 1.6 }}>
                Agenda, dossiers en facturatie op één plek. Aanmelden kan met eID of itsme®.
              </p>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>© 2026 Dafke — Antwerpen</div>
          </>
        }
      >
        <AuthCard
          brand={
            <>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 34,
                  height: 34,
                  borderRadius: "var(--r-md)",
                  background: "var(--accent)",
                  color: "var(--text-inv)",
                }}
              >
                <Icon name="idcard" size={18} />
              </span>
              <strong style={{ fontSize: 16 }}>Dafke</strong>
            </>
          }
          title="Welkom terug"
          description="Meld je aan om verder te werken in je dossier."
          footer={
            <>
              Nog geen account? <a href="#">Vraag toegang aan</a>
            </>
          }
          onSubmit={(event) => event.preventDefault()}
        >
          <SsoButton
            icon={<Icon name="idcard" size={19} />}
            label="Aanmelden met itsme®"
            description="Bevestig in je app"
            color="var(--amber)"
            loading={bezig === "itsme"}
            onClick={() => {
              setBezig("itsme");
              window.setTimeout(() => setBezig(null), 1600);
            }}
          />
          <SsoButton
            icon={<Icon name="scan" size={19} />}
            label="Aanmelden met eID"
            description="Kaartlezer nodig"
            loading={bezig === "eid"}
            onClick={() => {
              setBezig("eid");
              window.setTimeout(() => setBezig(null), 1600);
            }}
          />

          <AuthDivider>of met e-mail</AuthDivider>

          <Field label="E-mailadres">
            <Input type="email" placeholder="naam@praktijk.be" prefix={<Icon name="mail" />} />
          </Field>
          <Field label="Wachtwoord">
            <Input type="password" placeholder="••••••••" prefix={<Icon name="lock" />} />
          </Field>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Checkbox label="Aangemeld blijven" defaultChecked />
            <a href="#" style={{ fontSize: 13.5 }}>
              Wachtwoord vergeten?
            </a>
          </div>

          <Button type="submit" style={{ width: "100%" }}>
            Aanmelden
          </Button>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
