import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (googleCredential?: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        // Self-healing: Check if user owns a company but has wrong role
        if (profile.role !== 'COMPANY' && profile.role !== 'ADMIN') {
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('owner_id', userId)
                .maybeSingle();

            if (company) {
                // User owns a company, update their role
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'COMPANY' })
                    .eq('id', userId);

                if (updateError) {
                    console.error('Error updating user role to COMPANY:', updateError);
                }
                // Force update local profile regardless of DB persistence success
                profile.role = 'COMPANY';
            }
        }

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            role: profile.role,
            createdAt: profile.created_at
        } as User;
    };

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user.id).then(setUser);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchProfile(session.user.id).then(setUser);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (credential?: string) => {
        setIsLoading(true);
        try {
            if (credential) {
                await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: credential,
                });
            } else {
                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            return await supabase.auth.signUp({ email, password });
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signInWithEmail, signUpWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};