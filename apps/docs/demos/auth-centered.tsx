"use client";
import { AuthCard, AuthDivider, AuthLayout, Button, Field, Icon, Input, SsoButton } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <AuthLayout variant="centered" style={{ minHeight: 520 }}>
        <AuthCard
          title="Account aanmaken"
          description="Twee minuten werk, daarna kan je meteen plannen."
          footer={
            <>
              Al een account? <a href="#">Aanmelden</a>
            </>
          }
          onSubmit={(event) => event.preventDefault()}
        >
          <SsoButton icon={<Icon name="idcard" size={19} />} label="Verdergaan met itsme®" color="var(--amber)" />
          <AuthDivider />
          <Field label="Naam">
            <Input placeholder="Annelies Peeters" prefix={<Icon name="user" />} />
          </Field>
          <Field label="E-mailadres">
            <Input type="email" placeholder="naam@praktijk.be" prefix={<Icon name="mail" />} />
          </Field>
          <Field label="Wachtwoord" hint="Minstens 10 tekens.">
            <Input type="password" placeholder="••••••••" prefix={<Icon name="lock" />} />
          </Field>
          <Button type="submit" style={{ width: "100%" }}>
            Account aanmaken
          </Button>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
