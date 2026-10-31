import React from "react";
import { Instagram, Facebook, Youtube, Music2 } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Music2, label: "TikTok", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export default function SocialFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-border text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Follow Us
      </p>
      <div className="flex items-center justify-center gap-4">
        {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
          >
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </footer>
  );
}