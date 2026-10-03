"use client";
import { Avatar, AvatarGroup } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Avatar name="Davey Verhoeven" size={28} />
      <Avatar name="Davey Verhoeven" />
      <Avatar name="Ilse Peeters" size={46} status="online" />
      <Avatar name="Dafke BV" square color="var(--violet)" size={46} />
      <AvatarGroup max={3}>
        <Avatar name="Davey Verhoeven" />
        <Avatar name="Ilse Peeters" color="var(--blue)" />
        <Avatar name="Karim Aznar" color="var(--amber)" />
        <Avatar name="Sofie Claes" />
        <Avatar name="Tom Willems" />
      </AvatarGroup>
    </>
  );
}
