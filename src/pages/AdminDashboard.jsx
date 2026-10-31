import React, { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useContestants } from "@/lib/useContestants";
import ParishVotesChart from "@/components/admin/ParishVotesChart";
import DailyRevenueChart from "@/components/admin/DailyRevenueChart";
import ParishDailyRevenueChart from "@/components/admin/ParishDailyRevenueChart";
import DailyVotesChart from "@/components/admin/DailyVotesChart";
import BattleScoring from "@/components/admin/BattleScoring";
import ContestantManager from "@/components/admin/ContestantManager";
import DownloadScoresButton from "@/components/admin/DownloadScoresButton";
import JudgeActivityLog from "@/components/admin/JudgeActivityLog";
import JudgeProfileManager from "@/components/admin/JudgeProfileManager";
import InviteJudgeForm from "@/components/admin/InviteJudgeForm";
import VotingRoundEditor from "@/components/admin/VotingRoundEditor";
import ResetCompetitionButton from "@/components/admin/ResetCompetitionButton";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, LogIn, Coins, Vote, DollarSign, Users } from "lucide-react";

const BATCH_SIZE = 100;

const PARISHES = [
  "Kingston", "St. Andrew", "St. Catherine", "Clarendon", "St. Ann", "Trelawny",
  "St. James", "Hanover", "Westmoreland", "St. Elizabeth", "Manchester", "St. Mary",
  "Portland", "St. Thomas",
];

export default function AdminDashboard() {
  const { contestants, loading: loadingC } = useContestants();
  const [purchases, setPurchases] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      if (ok) {
        try {
          const me = await base44.auth.me();
          setUser(me);
        } catch (e) {
          setUser(null);
        }
      }
      setAuthChecked(true);
    });
  }, []);

  const pageRef = useRef(0);

  const fetchBatch = async () => {
    const skip = pageRef.current * BATCH_SIZE;
    pageRef.current += 1;
    const [data, voteData] = await Promise.all([
      base44.entities.TokenPurchase.list("-created_date", BATCH_SIZE, skip),
      base44.entities.Vote.list("-created_date", BATCH_SIZE, skip),
    ]);
    setPurchases((prev) => [...prev, ...data]);
    setVotes((prev) => [...prev, ...voteData]);
    setHasMore(data.length === BATCH_SIZE || voteData.length === BATCH_SIZE);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchBatch();
      } catch (e) {
        // ignore
      } finally {
        setLoadingP(false);
      }
    })();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchBatch();
    } finally {
      setLoadingMore(false);
    }
  };

  const parishData = useMemo(() => {
    return PARISHES.map((p) => ({
      parish: p.replace("St. ", "St."),
      votes: contestants
        .filter((c) => c.parish === p)
        .reduce((s, c) => s + (c.vote_count || 0), 0),
    })).sort((a, b) => b.votes - a.votes);
  }, [contestants]);

  const dailyRevenue = useMemo(() => {
    const map = {};
    purchases
      .filter((p) => p.status === "completed")
      .forEach((p) => {
        const day = new Date(p.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        map[day] = (map[day] || 0) + (p.amount_usd || 0);
      });
    return Object.entries(map)
      .map(([day, revenue]) => ({ day, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => new Date(a.day) - new Date(b.day));
  }, [purchases]);

  const totalVotes = contestants.reduce((s, c) => s + (c.vote_count || 0), 0);
  const totalRevenue = purchases
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (p.amount_usd || 0), 0);
  const completedPurchases = purchases.filter((p) => p.status === "completed").length;
  const totalTokensSold = purchases
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (p.tokens || 0), 0);
  const pricePerToken = totalTokensSold > 0 ? totalRevenue / totalTokensSold : 0;

  if (!authChecked)
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl mb-2">Admin access required</h1>
        <p className="text-muted-foreground mb-5">Sign in with an admin account to view this dashboard.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-sm font-semibold"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </button>
      </div>
    );

  if (user.role !== "admin")
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-10 h-10 mx-auto text-destructive mb-4" />
        <h1 className="font-display text-2xl mb-2">Not authorized</h1>
        <p className="text-muted-foreground">This dashboard is restricted to admin accounts.</p>
      </div>
    );

  const loading = loadingC || loadingP;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Admin</p>
        <h1 className="font-display text-4xl tracking-tight">Performance Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor votes and token revenue across the competition.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Vote} label="Total Votes" value={totalVotes.toLocaleString()} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
        <StatCard icon={Coins} label="Token Purchases" value={completedPurchases.toLocaleString()} />
        <StatCard icon={Users} label="Contestants" value={contestants.length.toLocaleString()} />
      </div>

      <div className="flex justify-end items-center gap-3 mb-4">
        <ResetCompetitionButton />
        <DownloadScoresButton contestants={contestants} />
      </div>
      <div className="mb-5">
        <ContestantManager contestants={contestants} />
      </div>
      <VotingRoundEditor />
      <InviteJudgeForm />
      <BattleScoring judgeId={user.id} />
      <JudgeProfileManager />
      <JudgeActivityLog />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          <DailyRevenueChart data={dailyRevenue} />
          <DailyVotesChart votes={votes} />
          <ParishDailyRevenueChart
            contestants={contestants}
            votes={votes}
            pricePerToken={pricePerToken}
          />
          <div className="grid lg:grid-cols-2 gap-5">
            <ParishVotesChart data={parishData} />
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-display text-2xl tabular-nums">{value}</div>
    </div>
  );
}