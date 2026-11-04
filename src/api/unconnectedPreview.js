// Read-only empty states let the original design load before backend setup.
// This is not authentication, a database, a wallet, or a payment simulation.
const unavailable = async () => {
  throw new Error('Backend connection pending. This action is unavailable in the preview.');
};
const unauthenticated = async () => {
  const error = new Error('Sign in is unavailable until the backend is connected.');
  error.status = 401;
  throw error;
};
const emptyEntity = Object.freeze({
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  subscribe: () => () => {},
  create: unavailable,
  update: unavailable,
  delete: unavailable,
  deleteMany: unavailable,
  bulkCreate: unavailable,
});
const readFunctions = {
  getVoterState: { tokens_balance: 0 },
  getScoreLeaderboard: { leaderboard: [] },
  getCompetitionHighlights: { highlights: [] },
  getBattleResults: { contestants: [], scores: [], results: [] },
};
export const unconnectedPreview = {
  app: { getPublicSettings: async () => ({ public_settings: {} }) },
  auth: {
    isAuthenticated: async () => false,
    me: unauthenticated,
    redirectToLogin: () => window.location.assign('/login'),
    logout: async () => window.location.assign('/'),
    loginViaEmailPassword: unavailable,
    loginWithProvider: () => window.location.assign('/login?backend=pending'),
    register: unavailable,
    verifyOtp: unavailable,
    resendOtp: unavailable,
    resetPasswordRequest: unavailable,
    resetPassword: unavailable,
    setToken: unavailable,
  },
  entities: new Proxy({}, { get: () => emptyEntity }),
  functions: { invoke: async name => {
    if (Object.prototype.hasOwnProperty.call(readFunctions, name)) {
      return { status: 200, data: { ...readFunctions[name] } };
    }
    return unavailable();
  } },
  integrations: { Core: { UploadPublicFile: unavailable, SendEmail: unavailable } },
};
