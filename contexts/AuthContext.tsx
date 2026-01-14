import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        // Tentar buscar o profile
        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // Se o profile não existe, tentar criar (fallback se o trigger falhou)
        if (error || !profile) {
            console.warn('Profile não encontrado, tentando criar...', error);
            
            // Buscar dados do usuário autenticado
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (authUser) {
                // Criar profile com dados do auth user
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: authUser.email || '',
                        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
                        picture: authUser.user_metadata?.picture || authUser.user_metadata?.avatar_url || null,
                        role: 'CUSTOMER'
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Erro ao criar profile:', createError);
                    // Se ainda assim falhar, retornar um profile básico
                    return {
                        id: userId,
                        email: authUser.email || '',
                        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'Usuário',
                        picture: authUser.user_metadata?.picture || authUser.user_metadata?.avatar_url || null,
                        role: 'CUSTOMER' as const,
                        createdAt: new Date().toISOString()
                    } as User;
                }
                profile = newProfile;
            } else {
                console.error('Não foi possível obter dados do usuário autenticado');
                return null;
            }
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
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                setIsLoading(false);
                return;
            }
            
            if (session) {
                const profile = await fetchProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                }
            }
            setIsLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Log apenas para eventos importantes (não INITIAL_SESSION)
            if (event !== 'INITIAL_SESSION') {
                console.log('Auth state changed:', event, session?.user?.email);
            }
            
            if (session) {
                const profile = await fetchProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

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
        <AuthContext.Provider value={{ user, isLoading, signInWithEmail, signUpWithEmail, logout }}>
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