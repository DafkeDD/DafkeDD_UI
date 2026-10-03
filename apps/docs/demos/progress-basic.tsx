"use client";
import { Progress, ProgressCircle } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 22, maxWidth: 460 }}>
      <Progress value={68} label="Opslag gebruikt" showValue />
      <Progress value={92} tone="amber" size="sm" label="Licenties toegewezen" showValue />
      <Progress value={100} tone="green" label="Migratie" showValue />
      <Progress label="Synchroniseren…" />
      <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
        <ProgressCircle value={72} showValue />
        <ProgressCircle value={38} tone="amber" size={72} thickness={7} showValue />
        <ProgressCircle value={100} tone="green" size={44} thickness={4} />
      </div>
    </div>
  );
}
