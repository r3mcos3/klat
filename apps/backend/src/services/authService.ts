import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  // Register a new user
  async register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    if (!data.user) {
      throw new AppError('Registratie mislukt', 400);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    };
  }

  // Login existing user
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError('Ongeldige inloggegevens', 401);
    }

    if (!data.user || !data.session) {
      throw new AppError('Inloggen mislukt', 401);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    };
  }

  // Logout user
  async logout(_accessToken: string) {
    // Set the session for this specific logout request
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AppError(error.message, 500);
    }

    return { message: 'Uitgelogd' };
  }

  // Get current user from access token
  async getCurrentUser(accessToken: string) {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      throw new AppError('Ongeldige token', 401);
    }

    if (!data.user) {
      throw new AppError('Gebruiker niet gevonden', 404);
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }

  // Verify access token and return user ID
  async verifyToken(accessToken: string): Promise<string> {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new AppError('Ongeldige of verlopen token', 401);
    }

    return data.user.id;
  }
}

export default new AuthService();
