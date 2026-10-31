import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, LogOut, MapPin, Camera, UserCircle, Video, Pencil, Check } from "lucide-react";
import MediaPreview from "@/components/portal/MediaPreview";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";

export default function ContestantPortal() {
  const [user, setUser] = useState(null);
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [stagedImage, setStagedImage] = useState(null);
  const [stagedVideo, setStagedVideo] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const me = await base44.auth.me();
      setUser(me);
      const list = await base44.entities.Contestant.list();
      setContestants(list);
    } catch (e) {
      setError(e.message || "Failed to load");
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
      if (stagedVideo) URL.revokeObjectURL(stagedVideo.url);
    };
  }, [stagedImage, stagedVideo]);

  const myContestant = contestants.find((c) => c.user_id === user?.id);
  const unclaimed = contestants.filter((c) => !c.user_id);

  const claim = async (id) => {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await base44.functions.invoke("claimContestant", { contestant_id: id });
      if (res.status >= 400) {
        setError(res.data?.error || "Claim failed");
        return;
      }
      setMsg("Contestant claimed! You can now manage your display photo.");
      await load();
    } catch (e) {
      setError(e.message || "Claim failed");
    } finally {
      setBusy(false);
    }
  };

  const onStageImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !myContestant) return;
    if (stagedImage) URL.revokeObjectURL(stagedImage.url);
    setStagedImage({ file, url: URL.createObjectURL(file) });
    setMsg("");
    setError("");
  };

  const saveImage = async () => {
    if (!stagedImage || !myContestant) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: stagedImage.file });
      await base44.entities.Contestant.update(myContestant.id, { image_url: file_url });
      URL.revokeObjectURL(stagedImage.url);
      setStagedImage(null);
      setMsg("Display photo updated.");
      await load();
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const cancelImage = () => {
    if (stagedImage) URL.revokeObjectURL(stagedImage.url);
    setStagedImage(null);
  };

  const removePhoto = async () => {
    if (!myContestant) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await base44.entities.Contestant.update(myContestant.id, { image_url: "" });
      setMsg("Display photo removed.");
      await load();
    } catch (e) {
      setError(e.message || "Remove failed");
    } finally {
      setBusy(false);
    }
  };

  const onStageVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file || !myContestant) return;
    if (stagedVideo) URL.revokeObjectURL(stagedVideo.url);
    setStagedVideo({ file, url: URL.createObjectURL(file) });
    setMsg("");
    setError("");
  };

  const saveVideo = async () => {
    if (!stagedVideo || !myContestant) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: stagedVideo.file });
      await base44.entities.Contestant.update(myContestant.id, { video_url: file_url });
      URL.revokeObjectURL(stagedVideo.url);
      setStagedVideo(null);
      setMsg("Performance video updated.");
      await load();
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const cancelVideo = () => {
    if (stagedVideo) URL.revokeObjectURL(stagedVideo.url);
    setStagedVideo(null);
  };

  const removeVideo = async () => {
    if (!myContestant) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await base44.entities.Contestant.update(myContestant.id, { video_url: "" });
      setMsg("Performance video removed.");
      await load();
    } catch (e) {
      setError(e.message || "Remove failed");
    } finally {
      setBusy(false);
    }
  };

  const startEditName = () => {
    setNameInput(myContestant?.name || "");
    setEditingName(true);
    setMsg("");
    setError("");
  };

  const saveName = async () => {
    if (!myContestant || !nameInput.trim()) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await base44.entities.Contestant.update(myContestant.id, { name: nameInput.trim() });
      setEditingName(false);
      setMsg("Name updated.");
      await load();
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const startEditBio = () => {
    setBioInput(myContestant?.bio || "");
    setEditingBio(true);
    setMsg("");
    setError("");
  };

  const saveBio = async () => {
    if (!myContestant) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await base44.entities.Contestant.update(myContestant.id, { bio: bioInput.trim() });
      setEditingBio(false);
      setMsg("Bio updated.");
      await load();
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await base44.auth.logout(window.location.origin);
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-1">Contestant Portal</p>
          <h1 className="font-display text-3xl tracking-tight">Welcome, {user?.full_name || user?.email}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {msg && <p className="text-sm text-amber-600 mb-4">{msg}</p>}

      {myContestant ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-40 h-52 rounded-xl overflow-hidden bg-muted shrink-0 mx-auto sm:mx-0">
              <Image
                src={myContestant.image_url}
                alt={myContestant.name}
                className="w-full h-full"
                fittingType="fill"
              />
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="font-display text-2xl bg-transparent border-b border-primary focus:outline-none w-full max-w-xs"
                    autoFocus
                  />
                  <Button size="icon" className="bg-amber-500 hover:bg-amber-600 text-black h-8 w-8" onClick={saveName} disabled={busy} aria-label="Save name">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl">{myContestant.name}</h2>
                  <button onClick={startEditName} className="text-muted-foreground hover:text-primary" title="Edit your name" aria-label="Edit your name">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                <MapPin className="w-4 h-4" /> {myContestant.parish} · {myContestant.talent_category}
              </div>

              <div className="mt-3">
                {editingBio ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      rows={4}
                      placeholder="Tell fans about yourself..."
                      className="w-full rounded-lg bg-transparent border border-primary text-sm p-2 focus:outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black" onClick={saveBio} disabled={busy}>
                        <Check className="w-4 h-4" /> Save Bio
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingBio(false)} disabled={busy}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-muted-foreground flex-1">
                      {myContestant.bio || "No bio yet. Add one so fans can learn about you."}
                    </p>
                    <button onClick={startEditBio} className="text-muted-foreground hover:text-primary shrink-0" title="Edit your bio" aria-label="Edit your bio">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                This photo appears on the parish page and your contestant card. Add or replace it below.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <label className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50">
                  <Upload className="w-4 h-4" />
                  {myContestant.image_url ? "Replace Photo" : "Add Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={onStageImage} disabled={busy} />
                </label>
                {stagedImage && (
                  <>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={saveImage} disabled={busy}>
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Save Photo
                    </Button>
                    <Button variant="outline" onClick={cancelImage} disabled={busy}>
                      Cancel
                    </Button>
                  </>
                )}
                {myContestant.image_url && !stagedImage && (
                  <Button variant="outline" onClick={removePhoto} disabled={busy}>
                    <Trash2 className="w-4 h-4" /> Remove
                  </Button>
                )}
                <Link to="/parishes">
                  <Button variant="ghost">
                    <Camera className="w-4 h-4" /> View on Parish Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-5 h-5 text-amber-600" />
              <h3 className="font-display text-lg">Performance Video</h3>
            </div>
            {myContestant.video_url ? (
              <div>
                <video
                  src={myContestant.video_url}
                  controls
                  className="w-full rounded-xl bg-black max-h-72"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <label className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50">
                    <Upload className="w-4 h-4" /> Replace Video
                    <input type="file" accept="video/*" className="hidden" onChange={onStageVideo} disabled={busy} />
                  </label>
                  {stagedVideo && (
                    <>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={saveVideo} disabled={busy}>
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Save Video
                      </Button>
                      <Button variant="outline" onClick={cancelVideo} disabled={busy}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {myContestant.video_url && !stagedVideo && (
                    <Button variant="outline" onClick={removeVideo} disabled={busy}>
                      <Trash2 className="w-4 h-4" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload your performance video. It plays on your contestant profile page.
                </p>
                <label className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50">
                  <Upload className="w-4 h-4" /> Add Video
                  <input type="file" accept="video/*" className="hidden" onChange={onStageVideo} disabled={busy} />
                </label>
                {stagedVideo && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={saveVideo} disabled={busy}>
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Save Video
                    </Button>
                    <Button variant="outline" onClick={cancelVideo} disabled={busy}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <MediaPreview
            contestant={myContestant}
            imageUrl={stagedImage?.url}
            videoUrl={stagedVideo?.url}
            isStagedImage={!!stagedImage}
            isStagedVideo={!!stagedVideo}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <UserCircle className="w-5 h-5" />
            <h2 className="font-display text-xl">Claim your contestant profile</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select the contestant profile that belongs to you. Once claimed, you can manage your display photo.
          </p>
          {unclaimed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unclaimed contestants available right now.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {unclaimed.map((c) => (
                <button
                  key={c.id}
                  onClick={() => claim(c.id)}
                  disabled={busy}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-amber-400/50 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image src={c.image_url} alt={c.name} className="w-full h-full" fittingType="fill" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.parish}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {busy && (
        <div className="grid place-items-center mt-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <DeleteAccountDialog />
    </div>
  );
}