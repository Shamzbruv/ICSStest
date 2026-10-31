import React, { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return coarse;
}

/**
 * options: [{ value, label }]
 * Desktop: Radix Select popover. Touch / small screens: bottom-sheet drawer.
 */
export default function MobileSelect({ value, onValueChange, options, placeholder, className, title, ...rest }) {
  const isMobile = useIsMobile();
  const coarse = useIsCoarsePointer();
  const [open, setOpen] = useState(false);

  if (!(isMobile || coarse)) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className} {...rest}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring [&>span]:line-clamp-1",
          !selected && "text-muted-foreground",
          className
        )}
        {...rest}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title || placeholder || "Select an option"}</DrawerTitle>
          </DrawerHeader>
          <div
            role="listbox"
            className="max-h-[60vh] overflow-y-auto px-4 pb-6"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onValueChange(o.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between min-h-[48px] px-3 rounded-lg text-left text-sm hover:bg-muted"
              >
                <span>{o.label}</span>
                {o.value === value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}