import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { unconnectedPreview } from './unconnectedPreview';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const isBackendPreview = !appId;

export const base44 = isBackendPreview ? unconnectedPreview : createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  appBaseUrl
});
