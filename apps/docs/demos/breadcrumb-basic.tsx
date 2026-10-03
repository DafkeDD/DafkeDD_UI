"use client";
import { Breadcrumb, BreadcrumbItem, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="#" icon={<Icon name="home" size={14} />}>Start</BreadcrumbItem>
      <BreadcrumbItem href="#">Tenants</BreadcrumbItem>
      <BreadcrumbItem href="#">ITWORXS BV</BreadcrumbItem>
      <BreadcrumbItem current>Facturen</BreadcrumbItem>
    </Breadcrumb>
  );
}
