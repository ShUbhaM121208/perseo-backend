import { supabase } from '../db/supabaseClient';
// If supabase.auth.getUser API differs, adapt per docs
export const requireSupabaseAuth = async (req, res, next) => {
    try {
        // Read Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Extract the access token
        const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
        if (!accessToken) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Validate token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email || ''
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
// Helper function to get user ID from request
export const getUserIdFromReq = (req) => {
    return req.user?.id;
};
// Helper function to get user email from request
export const getUserEmailFromReq = (req) => {
    return req.user?.email;
};
//# sourceMappingURL=supabaseAuth.js.map