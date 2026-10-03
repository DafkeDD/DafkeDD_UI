/**
 * Dafke UI — publieke API.
 * Alles is zelf geschreven: geen shadcn, geen Radix, geen externe UI-dependencies.
 */

/* ---------- Hulpmiddelen ---------- */
export { cn, type ClassValue } from "./lib/cn";
export { variants, type VariantConfig, type VariantsFn } from "./lib/variants";
export { Slot, composeRefs } from "./lib/slot";
export { Portal } from "./lib/portal";
export { useAnchorPosition, type Side, type Align, type AnchorOptions } from "./lib/anchor";
export * from "./lib/date";
export * from "./lib/schedule";
export * from "./lib/use-voice";
export * from "./lib/image";
export * from "./lib/chart-utils";
export * from "./lib/count-up";
export {
  useControllableState,
  useOutsideClick,
  useEscapeKey,
  useLockScroll,
  useFocusTrap,
  useRovingIndex,
  useCopyToClipboard,
  useMounted,
  useIsoLayoutEffect,
} from "./lib/hooks";

/* ---------- Iconen ---------- */
export { Icon, ICONS, ICON_NAMES, type IconName, type IconProps } from "./icons/icon";

/* ---------- Componenten ---------- */
export * from "./components/accordion";
export * from "./components/alert";
export * from "./components/alert-dialog";
export * from "./components/app-shell";
export * from "./components/area-chart";
export * from "./components/auth-layout";
export * from "./components/aspect-ratio";
export * from "./components/autocomplete";
export * from "./components/avatar-upload";
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/bar-list";
export * from "./components/bottom-nav";
export * from "./components/breadcrumb";
export * from "./components/button";
export * from "./components/calendar";
export * from "./components/carousel";
export * from "./components/card";
export * from "./components/category-bar";
export * from "./components/chart";
export * from "./components/checkbox";
export * from "./components/chip";
export * from "./components/citations";
export * from "./components/code-block";
export * from "./components/collapsible";
export * from "./components/color-picker";
export * from "./components/combo-chart";
export * from "./components/combobox";
export * from "./components/command";
export * from "./components/composer";
export * from "./components/confetti";
export * from "./components/contribution-graph";
export * from "./components/cookie-consent";
export * from "./components/copy-button";
export * from "./components/countdown";
export * from "./components/data-pill";
export * from "./components/data-table";
export * from "./components/date-picker";
export * from "./components/dialog";
export * from "./components/direction";
export * from "./components/drawer";
export * from "./components/dropdown-menu";
export * from "./components/editable";
export * from "./components/empty-state";
export * from "./components/entity-header";
export * from "./components/context-menu";
export * from "./components/fab";
export * from "./components/field";
export * from "./components/fieldset";
export * from "./components/file-drop";
export * from "./components/filter-panel";
export * from "./components/fold-card";
export * from "./components/form";
export * from "./components/fx-button";
export * from "./components/gauge";
export * from "./components/hover-card";
export * from "./components/image-compare";
export * from "./components/in-view";
export * from "./components/indicator";
export * from "./components/input";
export * from "./components/input-group";
export * from "./components/kanban";
export * from "./components/kbd";
export * from "./components/key-value";
export * from "./components/label";
export * from "./components/layout";
export * from "./components/lightbox";
export * from "./components/list-row";
export * from "./components/logout-button";
export * from "./components/marquee";
export * from "./components/masonry";
export * from "./components/menubar";
export * from "./components/message-thread";
export * from "./components/meter";
export * from "./components/modal-manager";
export * from "./components/mockup";
export * from "./components/navigation-menu";
export * from "./components/number-field";
export * from "./components/otp-input";
export * from "./components/pagination";
export * from "./components/period-nav";
export * from "./components/phone-input";
export * from "./components/popover";
export * from "./components/progress";
export * from "./components/prompt-input";
export * from "./components/pulse-dot";
export * from "./components/qr-code";
export * from "./components/radar-chart";
export * from "./components/radio-group";
export * from "./components/relative-time";
export * from "./components/resource-columns";
export * from "./components/rich-editor";
export * from "./components/rating";
export * from "./components/resizable";
export * from "./components/scatter-chart";
export * from "./components/scroll-area";
export * from "./components/scrollspy";
export * from "./components/search-field";
export * from "./components/section-header";
export * from "./components/segmented";
export * from "./components/select";
export * from "./components/selectable-grid";
export * from "./components/separator";
export * from "./components/sidebar";
export * from "./components/signature";
export * from "./components/skeleton";
export * from "./components/slider";
export * from "./components/spinner";
export * from "./components/split-button";
export * from "./components/stat";
export * from "./components/step-tracker";
export * from "./components/stepper";
export * from "./components/streaming-text";
export * from "./components/swatch-picker";
export * from "./components/swimlanes";
export * from "./components/switch";
export * from "./components/table";
export * from "./components/tabs";
export * from "./components/tags-input";
export * from "./components/task-item";
export * from "./components/text";
export * from "./components/textarea";
export * from "./components/theme";
export * from "./components/time-field";
export * from "./components/time-slot-list";
export * from "./components/timeline";
export * from "./components/toast";
export * from "./components/toggle";
export * from "./components/tool-call";
export * from "./components/toolbar";
export * from "./components/tooltip";
export * from "./components/tour";
export * from "./components/tracker";
export * from "./components/tree";
export * from "./components/visually-hidden";
export * from "./components/voice-button";
export * from "./components/week-schedule";
export * from "./components/workspace";
