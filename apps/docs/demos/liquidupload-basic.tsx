"use client";
import { Row, Stack, Text } from "@dafke/ui";
import { LiquidUploadButton } from "@dafke/ui/motion";

export default function Demo() {
  return (
    <Stack gap="lg">
      <Row gap="xl" wrap align="start">
        <LiquidUploadButton />
        <LiquidUploadButton layout="icon" tone="dark" />
        <LiquidUploadButton layout="icon" tone="light" />
        <LiquidUploadButton tone="dark" resetAfter={3000} />
      </Row>
      <Text variant="small" tone="muted">
        Klik een knop: er valt een druppel in het bakje, het niveau stijgt met de
        voortgang mee, en eronder staat hoeveel er al binnen is. Met onUpload
        opent hij een echte bestandskiezer.
      </Text>
    </Stack>
  );
}
