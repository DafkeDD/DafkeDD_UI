/**
 * Stappenplan voor de opbouw van Dafke UI.
 * Zet `done: true` zodra een stap klaar is — de introductiepagina toont de voortgang.
 */
export interface RoadmapStep {
  title: string;
  description: string;
  done?: boolean;
}

export const ROADMAP: RoadmapStep[] = [
  {
    title: "Fundament",
    description: "Monorepo, tokens, base-CSS, cn/variants/Slot/hooks, icon set, Button, Badge, Card, Spinner, Theme + documentatiesite.",
    done: true,
  },
  {
    title: "Formulieren & basis",
    description: "Label, Input, Textarea, Field, Checkbox, RadioGroup, Switch, Select, Separator, Kbd, Skeleton, Avatar, Chip, CopyButton.",
    done: true,
  },
  {
    title: "Navigatie & feedback",
    description: "Alert, Tabs, Segmented, Accordion, Breadcrumb, Pagination, Stepper, Progress, EmptyState, Table — de docs-site stapt over op eigen componenten.",
    done: true,
  },
  {
    title: "Overlays",
    description: "Dialog, Drawer, Popover, Tooltip, DropdownMenu, Toast, Command, Combobox, ModalProvider.",
    done: true,
  },
  {
    title: "Datum & planning",
    description: "Datum-helpers, Calendar, DatePicker, TimeField, PeriodNav, WeekSchedule, ResourceColumns, Swimlanes, TimeSlotList.",
    done: true,
  },
  {
    title: "Data & layout",
    description: "Stat, ListRow, TaskItem, DataPill, Charts, Toolbar, Sidebar, AppShell, Workspace, SectionHeader, EntityHeader, AuthLayout, ConfettiBurst.",
    done: true,
  },
  {
    title: "Extra's",
    description: "Slider, OtpInput, FileDrop, SwatchPicker, AvatarUpload, Composer, VoiceButton, PulseDot.",
    done: true,
  },
  {
    title: "CLI & registry",
    description: "npx dafke-ui init / add / list — componenten kopiëren naar andere projecten, zoals shadcn.",
    done: true,
  },
  {
    title: "Meertalig & labels",
    description:
      "next-intl met Nederlands, Frans, Engels en Duits, een taalkiezer in de topbar, en labels \"nieuw\" en \"bijgewerkt\" op componenten en demo's.",
    done: true,
  },
  {
    title: "De gaten uit de designs",
    description:
      "QrCode met een eigen encoder, RichEditor en BottomNav — de drie patronen die wel in de ontwerpen zaten maar nog niet in de library.",
    done: true,
  },
  {
    title: "Beweging (optioneel)",
    description:
      "MotionDrawerContent, ReorderList en MotionSegmented achter @dafke/ui/motion. De kern blijft dependency-vrij; de CLI slaat deze over bij add --all.",
    done: true,
  },
  {
    title: "Wat shadcn en daisyUI wél hadden",
    description:
      "AlertDialog met useConfirm, ContextMenu, HoverCard, Timeline, MessageThread, Mockup (browser, venster, telefoon), Resizable, ScrollArea, Carousel, Toggle en Collapsible.",
    done: true,
  },
  {
    title: "Animatie in de kern",
    description:
      "Uitgaande animaties voor Dialog, Drawer, Popover, Tooltip en Toast via de eigen hook usePresence, plus een echte hoogte-animatie voor Accordion. Zonder dependency.",
    done: true,
  },
  {
    title: "De lijst afgewerkt",
    description:
      "Rating, Countdown, Fab met SpeedDial, Indicator, AspectRatio, Fieldset en Menubar — de laatste gaten uit de vergelijking met shadcn/ui en daisyUI.",
    done: true,
  },
  {
    title: "Alles vertaald",
    description:
      "De introductie-, installatie- en themapagina, de labels op elke componentpagina en de props-tabellen staan nu in vier talen. De componentomschrijvingen zelf blijven voorlopig Nederlands.",
    done: true,
  },
];
