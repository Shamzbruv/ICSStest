import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Coins, Clapperboard, Store, Swords, Trophy, MapPin, Radio, UserCircle, Gavel, Award, GitCompare, Users, House, Menu, X } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useVoter } from "@/lib/useVoter";
import PendingVoteBanner from "@/components/PendingVoteBanner";
import BottomTabBar from "@/components/BottomTabBar";
import BackButton from "@/components/BackButton";
import PageTransition from "@/components/PageTransition";

const NAV_ITEMS = [
  ["/", "Home", House],
  ["/contestants", "Contestants", Clapperboard],
  ["/parishes", "Parishes", MapPin],
  ["/battles", "Battles", Swords],
  ["/battle-leaderboard", "Scoreboard", Award],
  ["/compare", "Compare", GitCompare],
  ["/leaderboard", "Leaderboard", Trophy],
  ["/live", "Live", Radio],
  ["/tokens", "Get Tokens", Store],
  ["/contestant-portal", "Singer Login", UserCircle],
  ["/judges", "Meet Judges", Users],
  ["/judge", "Judge Login", Gavel],
];

export default function Layout() {
  const { pathname } = useLocation();
  const { balance } = useVoter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItem = ([to, label, Icon]) =>
  <Link
    key={to}
    to={to}
    className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-full text-sm transition ${
    pathname === to ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"}`
    }>
      <Icon className="w-4 h-4" /> {label}
    </Link>;

  return (
    <div className="min-h-screen bg-background">
      <PendingVoteBanner />
      <header
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-6xl mx-auto px-4 min-h-16 py-2 flex flex-wrap items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-20 h-12 flex-shrink-0 block">
              <Image
                src="/brand/rep-yuh-place.webp"
                alt="Rep Yuh Place logo"
                className="w-full h-full object-contain" />
            </span>
            <span className="tracking-tight text-sm [font-family:'Helvetica_Bold',_sans-serif] font-bold uppercase leading-none flex items-center">REP YUH PLACE</span>
          </Link>
          <nav className="hidden md:flex w-full order-last flex-wrap items-center gap-1">
            {NAV_ITEMS.map(navItem)}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 border border-primary/30">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium tabular-nums">{balance ?? "…"}</span>
            </div>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden w-11 h-11 rounded-full border border-border grid place-items-center">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen &&
        <nav className="md:hidden border-t border-border bg-background/95 max-h-[70vh] overflow-y-auto px-4 py-3 grid grid-cols-2 gap-1">
            {NAV_ITEMS.map(navItem)}
          </nav>
        }
      </header>
      <main
        className="max-w-6xl mx-auto px-4 py-8 pb-28 md:pb-8 overflow-x-clip"
        style={{ overscrollBehavior: "none" }}>
        <BackButton />
        <PageTransition />
      </main>
      <BottomTabBar />
    </div>);

}