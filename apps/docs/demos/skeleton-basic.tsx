"use client";
import { Card, CardContent, Skeleton } from "@dafke/ui";

export default function Demo() {
  return (
    <Card style={{ maxWidth: 420 }}>
      <CardContent>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Skeleton circle width={44} height={44} />
          <div style={{ flex: 1 }}>
            <Skeleton width="45%" height={13} />
            <div style={{ height: 8 }} />
            <Skeleton width="70%" height={11} />
          </div>
        </div>
        <div style={{ height: 18 }} />
        <Skeleton lines={3} />
      </CardContent>
    </Card>
  );
}
