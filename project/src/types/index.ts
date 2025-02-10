export interface User {
  id: string;
  email: string;
  instagram_access_token?: string;
  instagram_user_id?: string;
  instagram_username?: string;
  created_at: string;
}

export interface Keyword {
  id: string;
  user_id: string;
  keyword: string;
  response_message: string;
  is_active: boolean;
  created_at: string;
}

export interface AutoReplyLog {
  id: string;
  user_id: string;
  keyword_id: string;
  comment_id: string;
  follower_name: string;
  sent_message: string;
  status: 'success' | 'error';
  error_message?: string;
  created_at: string;
}