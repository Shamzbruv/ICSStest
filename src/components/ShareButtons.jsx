import React, { useState } from "react";
import { Twitter, Facebook, MessageCircle, Link2, Check, Share2, Instagram, Music2 } from "lucide-react";

export default function ShareButtons({ contestant }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `I'm backing ${contestant?.name} from ${contestant?.parish} in the REP YUH PLACE singing competition! 🎤 Vote now:`;

  const enc = encodeURIComponent;
  const links = {
    x: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}`,
    whatsapp: `https://wa.me/?text=${enc(text + " " + url)}`,
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const copyAndOpen = async (platformUrl) => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch (e) {}
    window.open(platformUrl, "_blank", "noopener,noreferrer");
  };

  const btn = "w-11 h-11 rounded-full grid place-items-center transition";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5 mr-1">
        <Share2 className="w-4 h-4" /> Share
      </span>
      <button
        type="button"
        onClick={() => window.open(links.x, "_blank", "noopener,noreferrer")}
        className={`${btn} bg-black text-white hover:opacity-80`}
        aria-label="Share on X"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => window.open(links.facebook, "_blank", "noopener,noreferrer")}
        className={`${btn} bg-blue-600 text-white hover:opacity-80`}
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => window.open(links.whatsapp, "_blank", "noopener,noreferrer")}
        className={`${btn} bg-green-500 text-white hover:opacity-80`}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </button>
      <button
        onClick={() => copyAndOpen("https://www.instagram.com/")}
        className={`${btn} bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 text-white hover:opacity-90`}
        aria-label="Share on Instagram"
        title="Copied! Paste in Instagram"
      >
        <Instagram className="w-4 h-4" />
      </button>
      <button
        onClick={() => copyAndOpen("https://www.tiktok.com/")}
        className={`${btn} bg-black text-white hover:opacity-80`}
        aria-label="Share on TikTok"
        title="Copied! Paste in TikTok"
      >
        <Music2 className="w-4 h-4" />
      </button>
      <button
        onClick={copy}
        className={`${btn} bg-muted text-foreground hover:bg-accent`}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}