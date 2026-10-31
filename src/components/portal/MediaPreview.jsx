import React from "react";
import { MapPin, Coins, Video, Eye } from "lucide-react";

export default function MediaPreview({ contestant, imageUrl, videoUrl, isStagedImage, isStagedVideo }) {
  const img = imageUrl || contestant?.image_url;
  const vid = videoUrl || contestant?.video_url;
  const hasStaged = isStagedImage || isStagedVideo;

  return (
    <div className="rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/5 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Eye className="w-4 h-4 text-amber-600" />
        <span className="text-xs uppercase tracking-[0.2em] text-amber-600">Live Preview</span>
        {hasStaged && (
          <span className="text-xs text-amber-600">· unsaved — review then save</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        This is roughly how your photo and video appear to fans on the parish page and your profile.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Contestant card mockup */}
        <div className="rounded-xl border border-border bg-card overflow-hidden w-44 shrink-0">
          <div className="aspect-[3/4] bg-muted relative">
            {img ? (
              <img src={img} alt={contestant?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">No photo</div>
            )}
            {isStagedImage && (
              <span className="absolute top-1.5 left-1.5 text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-semibold">
                new
              </span>
            )}
          </div>
          <div className="p-2.5">
            <div className="font-medium text-sm truncate">{contestant?.name}</div>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />{contestant?.parish}
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3" />{contestant?.vote_count || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Video mockup */}
        <div className="flex-1 min-w-0">
          {vid ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <Video className="w-3.5 h-3.5" /> Performance video
                {isStagedVideo && (
                  <span className="text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-semibold">
                    new
                  </span>
                )}
              </div>
              <video src={vid} controls className="w-full rounded-xl bg-black max-h-44" />
            </div>
          ) : (
            <div className="h-full grid place-items-center text-xs text-muted-foreground border border-dashed border-border rounded-xl py-8">
              No performance video yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}