import data from "../content/props.generated.json";

export interface PropEntry {
  name: string;
  required: boolean;
  type: string;
  description: string;
  default?: string;
}

export interface InterfaceEntry {
  extends: string;
  props: PropEntry[];
}

const INTERFACES = data as unknown as Record<string, InterfaceEntry>;

export function propsFor(name: string): InterfaceEntry | undefined {
  return INTERFACES[name];
}
