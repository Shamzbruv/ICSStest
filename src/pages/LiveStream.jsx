import React from "react";
import { Radio, Youtube, ExternalLink, Bell } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";

const LIVE_STREAMS = [
  {
    title: "Season Finale — Live Show",
    description: "Watch the grand finale unfold live. Performances, results, and the crowning of the winner.",
    youtube_id: "live",
    channel: "Rep Yuh Place Official",
    isLive: true,
  },
];

const VIDEO_LINKS = [
  {
    title: "Audition Highlights — Episode 1",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    channel: "Rep Yuh Place Official",
  },
  {
    title: "Top 14 Parish Showdown",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    channel: "Rep Yuh Place Official",
  },
  {
    title: "Behind the Scenes — Rehearsals",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1516450390818-425f7d68f1c8?w=800",
    channel: "Rep Yuh Place Official",
  },
  {
    title: "Battle Round Recap",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2db8afd5?w=800",
    channel: "Rep Yuh Place Official",
  },
];

const YOUTUBE_CHANNEL = "https://www.youtube.com/@repyuhplace";

export default function LiveStream() {
  return (
    <PullToRefresh onRefresh={async () => { await new Promise((r) => setTimeout(r, 500)); }}>
      <section className="text-center py-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-2 flex items-center justify-center gap-2">
          <Radio className="w-4 h-4" /> Live Now
        </p>
        <h1 className="font-display text-4xl tracking-tight">Live Stream & Video Hub</h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Tune in to live shows and catch up on every performance, recap, and behind-the-scenes moment on YouTube.
        </p>
      </section>

      {/* Live stream */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Live Stream
        </h2>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-border bg-black aspect-video">
            <iframe
              src="https://www.youtube.com/embed/live_stream?channel=UC1234567890"
              title="Live stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
            <span className="inline-flex items-center gap-1.5 self-start text-xs font-bold uppercase tracking-wide bg-red-500 text-white px-2 py-0.5 rounded-full mb-3">
              <Radio className="w-3 h-3" /> Live
            </span>
            <h3 className="font-display text-xl leading-tight">{LIVE_STREAMS[0].title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{LIVE_STREAMS[0].description}</p>
            <div className="mt-3 text-xs text-muted-foreground">{LIVE_STREAMS[0].channel}</div>
            <a
              href={YOUTUBE_CHANNEL}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold transition"
            >
              <Bell className="w-4 h-4" /> Subscribe & Get Notified
            </a>
          </div>
        </div>
      </section>

      {/* YouTube links */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-600" /> Latest Videos
          </h2>
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Visit Channel <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VIDEO_LINKS.map((v) => (
            <a
              key={v.title}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="w-12 h-12 rounded-full bg-red-600 grid place-items-center shadow-lg">
                    <Youtube className="w-6 h-6 text-white" />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium leading-tight group-hover:text-amber-600 transition">{v.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{v.channel}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PullToRefresh>
  );
}