"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Icon } from "../icons/icon";

interface CarouselContextValue {
  spoorRef: React.RefObject<HTMLDivElement | null>;
  index: number;
  aantal: number;
  ganaar: (index: number) => void;
  vorige: () => void;
  volgende: () => void;
  kanVorige: boolean;
  kanVolgende: boolean;
  orientation: "horizontal" | "vertical";
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel(component: string): CarouselContextValue {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error(`<${component}> moet binnen <Carousel> staan.`);
  return context;
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Terug naar het begin na het laatste item (en omgekeerd). */
  loop?: boolean;
  /** Automatisch doorschuiven, in ms. 0 zet het uit. */
  autoPlay?: number;
  onIndexChange?: (index: number) => void;
}

/**
 * Carousel — horizontale of verticale reeks met scroll-snap.
 * Werkt met vegen, de pijltjestoetsen en de knoppen; zonder JS-animatie,
 * de browser doet het schuiven zelf.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { orientation = "horizontal", loop, autoPlay = 0, onIndexChange, className, children, ...rest },
  ref
) {
  const spoorRef = React.useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = React.useState(0);
  const [aantal, setAantal] = React.useState(0);

  // Het aantal items volgt uit de DOM, zodat je ze ook los kan meegeven.
  React.useEffect(() => {
    const spoor = spoorRef.current;
    if (!spoor) return;
    const tel = () => setAantal(spoor.querySelectorAll("[data-lui-carousel-item]").length);
    tel();
    const observer = new MutationObserver(tel);
    observer.observe(spoor, { childList: true });
    return () => observer.disconnect();
  }, []);

  // Welke kaart staat er in beeld? Afgeleid van de scrollpositie.
  React.useEffect(() => {
    const spoor = spoorRef.current;
    if (!spoor) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const items = [...spoor.querySelectorAll<HTMLElement>("[data-lui-carousel-item]")];
        if (items.length === 0) return;
        const positie = orientation === "horizontal" ? spoor.scrollLeft : spoor.scrollTop;
        const dichtst = items.reduce(
          (beste, item, i) => {
            const afstand = Math.abs((orientation === "horizontal" ? item.offsetLeft : item.offsetTop) - positie);
            return afstand < beste.afstand ? { i, afstand } : beste;
          },
          { i: 0, afstand: Infinity }
        );
        setIndex(dichtst.i);
      });
    };
    spoor.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      spoor.removeEventListener("scroll", onScroll);
    };
  }, [orientation]);

  React.useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const ganaar = React.useCallback(
    (doel: number) => {
      const spoor = spoorRef.current;
      if (!spoor) return;
      const items = [...spoor.querySelectorAll<HTMLElement>("[data-lui-carousel-item]")];
      const laatste = items.length - 1;
      const veilig = loop ? (doel < 0 ? laatste : doel > laatste ? 0 : doel) : Math.min(Math.max(doel, 0), laatste);
      const item = items[veilig];
      if (!item) return;
      spoor.scrollTo({
        [orientation === "horizontal" ? "left" : "top"]:
          orientation === "horizontal" ? item.offsetLeft : item.offsetTop,
        behavior: "smooth",
      });
    },
    [loop, orientation]
  );

  const vorige = React.useCallback(() => ganaar(index - 1), [ganaar, index]);
  const volgende = React.useCallback(() => ganaar(index + 1), [ganaar, index]);

  React.useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => ganaar(index + 1), autoPlay);
    return () => window.clearInterval(timer);
  }, [autoPlay, ganaar, index]);

  const waarde: CarouselContextValue = {
    spoorRef,
    index,
    aantal,
    ganaar,
    vorige,
    volgende,
    kanVorige: loop ? true : index > 0,
    kanVolgende: loop ? true : index < aantal - 1,
    orientation,
  };

  return (
    <CarouselContext.Provider value={waarde}>
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        className={cn("lui-carousel", `lui-carousel-${orientation}`, className)}
        onKeyDown={(event) => {
          const terug = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
          const heen = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
          if (event.key === terug) {
            event.preventDefault();
            vorige();
          } else if (event.key === heen) {
            event.preventDefault();
            volgende();
          }
        }}
        {...rest}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

export const CarouselTrack = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CarouselTrack({ className, ...rest }, ref) {
    const { spoorRef } = useCarousel("CarouselTrack");
    return (
      <div
        ref={(node) => {
          spoorRef.current = node;
          if (typeof ref === "function") ref(node as HTMLDivElement);
          else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
        }}
        tabIndex={0}
        className={cn("lui-carousel-track", className)}
        {...rest}
      />
    );
  }
);

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Breedte van dit item, bv. "80%" of 260. Standaard de volle breedte. */
  size?: number | string;
}

export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(function CarouselItem(
  { size, className, style, ...rest },
  ref
) {
  const { orientation } = useCarousel("CarouselItem");
  const maat = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      ref={ref}
      data-lui-carousel-item=""
      role="group"
      aria-roledescription="slide"
      className={cn("lui-carousel-item", className)}
      style={{ ...(maat ? { flexBasis: maat, [orientation === "horizontal" ? "width" : "height"]: maat } : {}), ...style }}
      {...rest}
    />
  );
});

export interface CarouselButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(
  function CarouselPrevious({ label = "Vorige", className, ...rest }, ref) {
    const { vorige, kanVorige, orientation } = useCarousel("CarouselPrevious");
    return (
      <Button
        ref={ref}
        variant="secondary"
        size="sm"
        aria-label={label}
        disabled={!kanVorige}
        className={cn("lui-carousel-btn", className)}
        icon={<Icon name={orientation === "horizontal" ? "chevronLeft" : "chevronUp"} size={16} />}
        onClick={vorige}
        {...rest}
      />
    );
  }
);

export const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(function CarouselNext(
  { label = "Volgende", className, ...rest },
  ref
) {
  const { volgende, kanVolgende, orientation } = useCarousel("CarouselNext");
  return (
    <Button
      ref={ref}
      variant="secondary"
      size="sm"
      aria-label={label}
      disabled={!kanVolgende}
      className={cn("lui-carousel-btn", className)}
      icon={<Icon name={orientation === "horizontal" ? "chevronRight" : "chevronDown"} size={16} />}
      onClick={volgende}
      {...rest}
    />
  );
});

export const CarouselDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CarouselDots({ className, ...rest }, ref) {
    const { aantal, index, ganaar } = useCarousel("CarouselDots");
    return (
      <div ref={ref} className={cn("lui-carousel-dots", className)} {...rest}>
        {Array.from({ length: aantal }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Naar item ${i + 1}`}
            aria-current={i === index}
            data-active={i === index ? "" : undefined}
            className="lui-carousel-dot"
            onClick={() => ganaar(i)}
          />
        ))}
      </div>
    );
  }
);
