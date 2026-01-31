// Homepage has dynamic data (posts from database), so we must NOT prerender
// This ensures new posts appear immediately without needing a rebuild
export const prerender = false;
