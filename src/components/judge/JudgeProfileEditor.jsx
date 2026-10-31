import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, UserCircle2 } from "lucide-react";

export default function JudgeProfileEditor({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [stagedImage, setStagedImage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.JudgeProfile.filter({ user_id: user.id });
      const p = list?.[0] || null;
      setProfile(p);
      setName(p?.name || user.full_name || "");
      setProfession(p?.profession || "");
      setBio(p?.bio || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (stagedImage) URL.revokeObjectURL(stagedImage.url);
    };
  }, [stagedImage]);

  const onStageImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (stagedImage) URL.revokeObjectURL(stagedImage.url);
    setStagedImage({ file, url: URL.createObjectURL(file) });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      let image_url = profile?.image_url || "";
      if (stagedImage) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: stagedImage.file });
        image_url = res.file_url;
      }
      const data = { user_id: user.id, name: name.trim(), profession: profession.trim(), bio: bio.trim(), image_url };
      if (profile) {
        await base44.entities.JudgeProfile.update(profile.id, data);
      } else {
        await base44.entities.JudgeProfile.create(data);
      }
      if (stagedImage) URL.revokeObjectURL(stagedImage.url);
      setStagedImage(null);
      setMsg("Profile saved. It's now visible on the public Judges page.");
      await load();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const previewUrl = stagedImage?.url || profile?.image_url;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCircle2 className="w-5 h-5 text-amber-600" />
        <h3 className="font-display text-lg">Public Judge Profile</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Add your photo, profession, and a short bio. This appears on the public Judges page for fan transparency.
      </p>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}
      {msg && <p className="text-sm text-amber-600 mb-3">{msg}</p>}

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted shrink-0 mx-auto sm:mx-0">
          <Image src={previewUrl} alt={name} className="w-full h-full" fittingType="fill" />
        </div>
        <div className="flex-1 space-y-3">
          <label className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {previewUrl ? "Replace Photo" : "Add Photo"}
            <input type="file" accept="image/*" className="hidden" onChange={onStageImage} disabled={busy} />
          </label>

          <div>
            <Label htmlFor="jp-name">Display Name</Label>
            <Input id="jp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" disabled={busy} />
          </div>
          <div>
            <Label htmlFor="jp-profession">Profession</Label>
            <Input
              id="jp-profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Producer, Artist, Music Executive"
              disabled={busy}
            />
          </div>
          <div>
            <Label htmlFor="jp-bio">Bio</Label>
            <textarea
              id="jp-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short bio for fans..."
              className="w-full rounded-lg bg-transparent border border-input text-sm p-2 focus:outline-none resize-none"
              disabled={busy}
            />
          </div>
          <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={save} disabled={busy || !name.trim()}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}