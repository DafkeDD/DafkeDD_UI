"use client";
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Icon } from "@dafke/ui";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALES = [
  { code: "nl", label: "Nederlands", short: "NL" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "en", label: "English", short: "EN" },
  { code: "de", label: "Deutsch", short: "DE" },
] as const;

/** Taalkiezer in de topbar. Zet de NEXT_LOCALE-cookie via next-intl. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("shell");

  const current = LOCALES.find((item) => item.code === locale);

  function switchLocale(code: string) {
    if (code !== locale) router.replace(pathname, { locale: code });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("language")}
          icon={<Icon name="globe" size={15} />}
          iconRight={<Icon name="chevronDown" size={13} />}
          suppressHydrationWarning
        >
          {current?.short ?? locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent minWidth={180}>
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            icon={item.code === locale ? <Icon name="check" size={14} /> : undefined}
            onClick={() => switchLocale(item.code)}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
