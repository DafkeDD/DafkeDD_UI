"use client";
import { useState } from "react";
import { Field, Stack, TagsInput, Text } from "@dafke/ui";

export default function Demo() {
  const [tags, setTags] = useState(["urgent", "nazicht"]);

  return (
    <Stack gap="md" style={{ maxWidth: 420 }}>
      <Field label="Labels" hint="Enter of een komma maakt er een chip van; Backspace haalt de laatste weg.">
        <TagsInput value={tags} onValueChange={setTags} suggestions={["urgent", "nazicht", "controle", "administratie"]} />
      </Field>
      <Field label="Genodigden" hint="Enkel geldige e-mailadressen worden aanvaard.">
        <TagsInput
          defaultValue={["davey@itworxs.be"]}
          validate={(tag) => /.+@.+\..+/.test(tag)}
          placeholder="naam@voorbeeld.be"
          max={5}
        />
      </Field>
      <Text variant="small" tone="muted">{tags.length} labels</Text>
    </Stack>
  );
}
