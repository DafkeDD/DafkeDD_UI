"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { ConfettiBurst } from "./confetti";

export type TaskPriority = "none" | "low" | "normal" | "high";

export interface TaskMetaTag {
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** Kleur van het label, bv. rood voor een verlopen deadline. */
  tone?: "neutral" | "accent" | "green" | "amber" | "red" | "blue" | "violet";
  /** Gekleurd bolletje vóór het label, bv. de kleur van een lijst. */
  dot?: string;
}

export interface TaskItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onToggle"> {
  title: React.ReactNode;
  done?: boolean;
  priority?: TaskPriority;
  /** Labels onder de titel: lijst, deadline, herhaling … */
  tags?: TaskMetaTag[];
  /** Voortgang van deeltaken, bv. { done: 2, total: 5 }. */
  progress?: { done: number; total: number };
  /** Wordt aangeroepen bij het aan- of afvinken. */
  onToggle?: (done: boolean) => void;
  /** Klik op de rij zelf. */
  onOpen?: () => void;
  /** Toont een verwijderknop; de rij schuift weg vóór de aanroep. */
  onDelete?: () => void;
  /** Confetti bij het afvinken. */
  celebrate?: boolean;
  /** Extra knoppen rechts. */
  actions?: React.ReactNode;
}

/**
 * TaskItem — één taak in een lijst: afvinken, prioriteit, labels en voortgang
 * van deeltaken. Bij het afvinken springt er confetti uit de knop.
 */
export const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(function TaskItem(
  {
    title,
    done = false,
    priority = "none",
    tags,
    progress,
    onToggle,
    onOpen,
    onDelete,
    celebrate = true,
    actions,
    className,
    children,
    onClick,
    ...rest
  },
  ref
) {
  const [burst, setBurst] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const wasDone = React.useRef(done);

  React.useEffect(() => {
    if (!wasDone.current && done && celebrate) setBurst(true);
    wasDone.current = done;
  }, [done, celebrate]);

  const remove = () => {
    setRemoving(true);
    window.setTimeout(() => onDelete?.(), 260);
  };

  return (
    <div
      ref={ref}
      data-done={done ? "" : undefined}
      data-removing={removing ? "" : undefined}
      className={cn("lui-task", `lui-task-prio-${priority}`, onOpen && "lui-task-clickable", className)}
      {...rest}
      // Ná {...rest}: een eigen onClick mag onOpen niet stilzwijgend vervangen.
      onClick={(event) => {
        onClick?.(event);
        onOpen?.();
      }}
    >
      <span className="lui-task-prio" aria-hidden="true" />

      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? "Vinkje weghalen" : "Afvinken"}
        className="lui-task-check"
        onClick={(event) => {
          event.stopPropagation();
          onToggle?.(!done);
        }}
      >
        <Icon name="check" size={14} strokeWidth={3} />
        {burst && <ConfettiBurst onDone={() => setBurst(false)} />}
      </button>

      <div className="lui-task-body">
        <div className="lui-task-title">{title}</div>

        {(tags?.length || progress) && (
          <div className="lui-task-meta">
            {tags?.map((tag, index) => (
              <span key={index} className={cn("lui-task-tag", tag.tone && `lui-task-tag-${tag.tone}`)}>
                {tag.dot && <span className="lui-task-tag-dot" style={{ background: tag.dot }} />}
                {tag.icon}
                {tag.label}
              </span>
            ))}

            {progress && progress.total > 0 && (
              <span className="lui-task-progress">
                <span className="lui-task-progress-bar">
                  <i style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                </span>
                {progress.done}/{progress.total}
              </span>
            )}
          </div>
        )}

        {children}
      </div>

      <div className="lui-task-actions" onClick={(event) => event.stopPropagation()}>
        {actions}
        {onOpen && (
          <button type="button" className="lui-task-action" aria-label="Openen" onClick={onOpen}>
            <Icon name="chevronRight" size={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="lui-task-action lui-task-action-danger"
            aria-label="Verwijderen"
            onClick={remove}
          >
            <Icon name="trash" size={15} />
          </button>
        )}
      </div>
    </div>
  );
});

export interface TaskListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rand en schaduw rond de lijst. */
  bordered?: boolean;
}

/** TaskList — container voor TaskItems. */
export const TaskList = React.forwardRef<HTMLDivElement, TaskListProps>(function TaskList(
  { bordered, className, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-tasklist", bordered && "lui-tasklist-bordered", className)} {...rest} />
  );
});
