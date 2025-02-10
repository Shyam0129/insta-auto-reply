import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { exchangeCodeForToken, getInstagramUserProfile } from '../config/instagram';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for Instagram access token
        const accessToken = await exchangeCodeForToken(code);
        const instagramProfile = await getInstagramUserProfile(accessToken);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error('Authentication failed');
        }

        // Update user with Instagram token and profile
        const { error: updateError } = await supabase
          .from('users')
          .update({
            instagram_access_token: accessToken,
            instagram_user_id: instagramProfile.id,
            instagram_username: instagramProfile.username,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw new Error('Failed to save Instagram token');
        }

        setUser({
          id: user.id,
          email: user.email!,
          instagram_access_token: accessToken,
          instagram_user_id: instagramProfile.id,
          instagram_username: instagramProfile.username,
          created_at: new Date().toISOString(),
        });

        navigate('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Instagram authentication...</p>
      </div>
    </div>
  );
}