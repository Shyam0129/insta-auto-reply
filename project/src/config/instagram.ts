import { supabase } from '../lib/supabase';

export const INSTAGRAM_CONFIG = {
  clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
  clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  accessToken: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN,
  scope: 'user_profile,user_media',
  apiBaseUrl: 'https://graph.instagram.com',
};

export const getInstagramAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CONFIG.clientId,
    redirect_uri: INSTAGRAM_CONFIG.redirectUri,
    scope: INSTAGRAM_CONFIG.scope,
    response_type: 'code',
  });

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  try {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CONFIG.clientId,
        client_secret: INSTAGRAM_CONFIG.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_CONFIG.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

export const getInstagramUserProfile = async (accessToken = INSTAGRAM_CONFIG.accessToken) => {
  try {
    const response = await fetch(
      `${INSTAGRAM_CONFIG.apiBaseUrl}/me?fields=id,username&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};