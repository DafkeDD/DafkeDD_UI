"use client";
import {
  Button,
  Form,
  FormActions,
  FormField,
  Input,
  Text,
  Textarea,
  rules,
  useForm,
} from "@dafke/ui";

export default function Demo() {
  const form = useForm({
    initialValues: { naam: "", email: "", website: "", bericht: "" },
    validate: {
      naam: rules.required("Vul je naam in"),
      email: [rules.required("Vul een e-mailadres in"), rules.email()],
      website: rules.pattern(/^https?:\/\/.+/, "Begin met http:// of https://"),
      bericht: [rules.required("Schrijf even iets"), rules.minLength(15)],
    },
    onSubmit: (waarden) =>
      new Promise<void>((klaar) => {
        window.setTimeout(() => {
          window.alert(`Verstuurd door ${waarden.naam}`);
          klaar();
        }, 700);
      }),
  });

  return (
    <Form form={form} style={{ maxWidth: 420 }}>
      <FormField name="naam" form={form} label="Naam" required>
        <Input {...form.inputProps("naam")} placeholder="Davey" />
      </FormField>

      <FormField name="email" form={form} label="E-mail" required>
        <Input {...form.inputProps("email")} type="email" placeholder="davey@voorbeeld.be" />
      </FormField>

      <FormField name="website" form={form} label="Website" hint="Optioneel.">
        <Input {...form.inputProps("website")} placeholder="https://" />
      </FormField>

      <FormField name="bericht" form={form} label="Bericht" required>
        <Textarea {...form.inputProps("bericht")} rows={3} placeholder="Waarmee kunnen we helpen?" />
      </FormField>

      <FormActions align="between">
        <Text variant="small" tone="muted">
          {form.pristine ? "Nog niets ingevuld" : form.invalid ? "Nog niet compleet" : "Klaar om te versturen"}
        </Text>
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={form.pristine}>
            Wissen
          </Button>
          <Button type="submit" loading={form.submitting}>
            Versturen
          </Button>
        </div>
      </FormActions>
    </Form>
  );
}
