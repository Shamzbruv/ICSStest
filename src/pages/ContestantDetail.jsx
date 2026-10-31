import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Coins, Loader2, MapPin } from "lucide-react";
import VoteModal from "@/components/VoteModal";
import ShareButtons from "@/components/ShareButtons";
import Comments from "@/components/Comments";
import PullToRefresh from "@/components/PullToRefresh";
import { useVoter } from "@/lib/useVoter";
import { useTopSingers } from "@/lib/useTopSingers";
import TopRankBadge from "@/components/TopRankBadge";
import ContestantJudgeScore from "@/components/ContestantJudgeScore";

export default function ContestantDetail() {
  const { id } = useParams();
  const { voterId, balance } = useVoter();
  const [contestant, setContestant] = useState(undefined);
  const [voteOpen, setVoteOpen] = useState(false);
  const { topMap } = useTopSingers();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const c = await base44.entities.Contestant.get(id);
        if (active) setContestant(c);
      } catch (e) {
        if (active) setContestant(null);
      }
    };
    load();
    const unsub = base44.entities.Contestant.subscribe((event) => {
      if (event.id === id && active) setContestant(event.data);
    });
    const onOptimistic = (e) => {
      const { contestant_id, votes } = e.detail || {};
      if (contestant_id !== id) return;
      setContestant((c) => (c ? { ...c, vote_count: Math.max(0, (c.vote_count || 0) + votes) } : c));
    };
    window.addEventListener("vote-optimistic", onOptimistic);
    return () => {
      active = false;
      unsub();
      window.removeEventListener("vote-optimistic", onOptimistic);
    };
  }, [id]);

  if (contestant === null)
    return (
      <div className="text-center py-20 text-muted-foreground">
        Contestant not found. <Link to="/" className="underline text-foreground">Back</Link>
      </div>
    );
  if (!contestant)
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  const reload = async () => {
    setContestant(await base44.entities.Contestant.get(id));
  };

  return (
    <PullToRefresh onRefresh={reload}>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> All contestants
      </Link>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Link to={`/parishes?c=${contestant.id}`} className="group relative block aspect-video rounded-3xl overflow-hidden bg-black">
          {contestant.video_url ? (
            <video
              src={contestant.video_url}
              controls
              poster={contestant.image_url}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <Image src={contestant.image_url} alt={contestant.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" fittingType="fill" />
              <span className="absolute bottom-3 left-3 text-xs uppercase tracking-widest bg-black/60 text-white px-2.5 py-1 rounded-full">
                No video submitted
              </span>
            </>
          )}
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition">
            <MapPin className="w-3.5 h-3.5" /> View on parish page
          </div>
        </Link>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-primary mb-2">{contestant.talent_category}</span>
          <h1 className="font-display text-4xl tracking-tight">{contestant.name}</h1>
          {topMap[contestant.id] && (
            <div className="mt-3">
              <TopRankBadge rank={topMap[contestant.id]} />
            </div>
          )}
          {contestant.parish && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> Representing {contestant.parish}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 fill-primary text-primary" />
            <span className="font-display text-2xl tabular-nums">
              {(contestant.vote_count || 0).toLocaleString()}
            </span>
            <span className="text-muted-foreground">votes</span>
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {contestant.bio || "This contestant hasn't added a bio yet."}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setVoteOpen(true)}>
              <Heart className="w-4 h-4 mr-1" /> Vote Now
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="w-4 h-4 text-primary" /> {balance ?? 0} tokens
            </div>
          </div>
          <div className="mt-5">
            <ShareButtons contestant={contestant} />
          </div>
        </div>
      </div>
      <ContestantJudgeScore contestantId={contestant.id} />
      <Comments contestantId={contestant.id} />
      <VoteModal
        contestant={contestant}
        open={voteOpen}
        onOpenChange={setVoteOpen}
        voterId={voterId}
        balance={balance ?? 0}
      />
    </PullToRefresh>
  );
}