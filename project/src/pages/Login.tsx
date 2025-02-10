import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { INSTAGRAM_CONFIG, getInstagramUserProfile } from '../config/instagram';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create a new anonymous session
        let { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'anonymous@example.com',
          password: 'anonymous123'
        });

        if (signInError) {
          // If sign in fails, try to create the anonymous user
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: 'anonymous@example.com',
            password: 'anonymous123'
          });

          if (signUpError) throw signUpError;
          if (!authData.user) throw new Error('Failed to create user');

          user = authData.user;
        }

        if (!user) {
          throw new Error('No user found after authentication');
        }

        // Check if we have an Instagram access token
        if (INSTAGRAM_CONFIG.accessToken) {
          try {
            const instagramProfile = await getInstagramUserProfile();
            
            // Update user with Instagram info
            const { error: updateError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email!,
                instagram_access_token: INSTAGRAM_CONFIG.accessToken,
                instagram_user_id: instagramProfile.id,
                instagram_username: instagramProfile.username,
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (updateError) throw updateError;

            setUser({
              id: user.id,
              email: user.email!,
              instagram_access_token: INSTAGRAM_CONFIG.accessToken,
              instagram_user_id: instagramProfile.id,
              instagram_username: instagramProfile.username,
              created_at: new Date().toISOString(),
            });

            navigate('/dashboard');
          } catch (instagramError) {
            console.error('Instagram error:', instagramError);
            setError('Failed to connect to Instagram. Please check your access token.');
          }
        } else {
          setError('Please add your Instagram access token to the .env file');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Instagram className="mx-auto h-12 w-12 text-pink-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Instagram Auto Reply Tool
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your Instagram account to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-sm text-gray-600">Connecting to services...</p>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-600">
              {INSTAGRAM_CONFIG.accessToken ? 
                'Connecting to Instagram...' : 
                'Please add your Instagram access token to the .env file'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}