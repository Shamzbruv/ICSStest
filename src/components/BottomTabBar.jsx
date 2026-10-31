import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { House, Clapperboard, Swords, Coins, Radio } from "lucide-react";

const TABS = [
  { root: "/", label: "Home", Icon: House, match: (p) => p === "/" },
  { root: "/contestants", label: "Contestants", Icon: Clapperboard, match: (p) => p.startsWith("/contestant") && !p.startsWith("/contestant-portal") },
  { root: "/battles", label: "Battles", Icon: Swords, match: (p) => p.startsWith("/battle") },
  { root: "/tokens", label: "Tokens", Icon: Coins, match: (p) => p === "/tokens" },
  { root: "/live", label: "Live", Icon: Radio, match: (p) => p === "/live" },
];

export default function BottomTabBar() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  // Each tab remembers its own last screen (its navigation stack position)
  const stacks = useRef({});

  useEffect(() => {
    const tab = TABS.find((t) => t.match(pathname));
    if (tab) stacks.current[tab.root] = pathname + search;
  }, [pathname, search]);

  const onTap = (e, tab, active) => {
    e.preventDefault();
    navigate(active ? tab.root : stacks.current[tab.root] || tab.root);
  };

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.root}
              to={tab.root}
              onClick={(e) => onTap(e, tab, active)}
              className={`min-h-[56px] flex flex-col items-center justify-center gap-0.5 px-0.5 select-none ${
                active ? "text-primary" : "text-foreground/70"
              }`}
            >
              <tab.Icon className="w-5 h-5" />
              <span className="text-sm leading-none tracking-tighter truncate max-w-full">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}