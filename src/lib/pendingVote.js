const KEY = "rep_yuh_pending_vote";
export const PENDING_VOTE_EVENT = "pending-vote-changed";

export function getPendingVote() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function setPendingVote(vote) {
  localStorage.setItem(KEY, JSON.stringify(vote));
  window.dispatchEvent(new Event(PENDING_VOTE_EVENT));
}

export function clearPendingVote() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(PENDING_VOTE_EVENT));
}