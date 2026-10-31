import React from "react";
import { Link } from "react-router-dom";
import { Radio, UserPlus, Users } from "lucide-react";
import { useContestants } from "@/lib/useContestants";
import HowItWorks from "@/components/HowItWorks";
import VotingCountdown from "@/components/VotingCountdown";
import CompetitionHighlights from "@/components/CompetitionHighlights";
import SocialFooter from "@/components/SocialFooter";
import PullToRefresh from "@/components/PullToRefresh";

export default function Home() {
  const { contestants, refresh } = useContestants();
  const onRefresh = async () => {
    await refresh();
    window.dispatchEvent(new Event("tokens-updated"));
  };
  const totalVotes = contestants.reduce((s, c) => s + (c.vote_count || 0), 0);

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <section className="text-center py-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Season Finale · Live Now</p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] tracking-tight">
          REP YUH PLACE
        </h1>
        <p className="mt-3 font-heading text-xl md:text-2xl font-medium tracking-wide text-muted-foreground">
          Talent Competition
        </p>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Watch performances, support your favorites, and vote in real time. Every token fuels a performer's journey to the crown.
        </p>
        <Link
          to="/live"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-sm font-semibold shadow-lg transition"
        >
          <Radio className="w-4 h-4" /> Watch Live Now
        </Link>
        <div className="mt-4">
          <Link
            to="/contestant-portal"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wide transition"
          >
            <UserPlus className="w-4 h-4" /> Register as a Contestant
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="font-display text-2xl">{contestants.length}</span>
            <br />
            <span className="text-muted-foreground">Contestants</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <span className="font-display text-2xl tabular-nums">{totalVotes.toLocaleString()}</span>
            <br />
            <span className="text-muted-foreground">Votes Cast</span>
          </div>
        </div>
      </section>

      <VotingCountdown />

      <HowItWorks />

      <CompetitionHighlights />

      <div className="text-center mt-4">
        <Link
          to="/contestants"
          className="inline-flex items-center gap-2 rounded-full border border-border hover:border-primary hover:text-primary px-6 py-3 text-sm font-semibold transition"
        >
          <Users className="w-4 h-4" /> Browse All Contestants
        </Link>
      </div>

      <SocialFooter />
    </PullToRefresh>
  );
}