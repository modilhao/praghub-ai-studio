import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<User | null>;
    signUpWithEmail: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2',location:'contexts/AuthContext.tsx:19',message:'fetch_profile_start',data:{userIdSuffix:userId.slice(-4)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        // Tentar buscar o profile
        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2',location:'contexts/AuthContext.tsx:26',message:'fetch_profile_result',data:{hasProfile:!!profile,hasError:!!error,errorCode:error?.code||null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

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
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'contexts/AuthContext.tsx:102',message:'check_session_start',data:{},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'contexts/AuthContext.tsx:105',message:'check_session_error',data:{errorMessage:error.message},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                setIsLoading(false);
                return;
            }
            
            if (session) {
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'contexts/AuthContext.tsx:110',message:'check_session_has_session',data:{userIdSuffix:session.user.id.slice(-4)},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                const profile = await fetchProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                }
            }
            setIsLoading(false);
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'contexts/AuthContext.tsx:116',message:'check_session_done',data:{hasSession:!!session},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
        };

        checkSession();

        // Listen for auth changes (ex: login via OAuth, logout, etc)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'contexts/AuthContext.tsx:122',message:'auth_state_change',data:{event,hasSession:!!session},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (session) {
                const profile = await fetchProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'contexts/AuthContext.tsx:131',message:'auth_state_done',data:{userSet:!!session},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * IMPORTANTE: Este método retorna o User após carregar o profile.
     * 
     * Padrão de uso:
     * - Sempre aguarde o retorno antes de fazer redirecionamento
     * - O profile é carregado e o state é atualizado antes do retorno
     * - Use o retorno para redirecionamento imediato
     * - O useEffect também funciona como fallback para casos de sessão existente
     * 
     * Exemplo:
     * ```typescript
     * const user = await signInWithEmail(email, password);
     * if (user) {
     *   navigate(user.role === 'COMPANY' ? '/dashboard' : '/');
     * }
     * ```
     */
    const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
        setIsLoading(true);
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'contexts/AuthContext.tsx:155',message:'sign_in_start',data:{emailLen:email.length},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'contexts/AuthContext.tsx:158',message:'sign_in_result',data:{hasUser:!!data?.user,hasError:!!error},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (error) throw error;
            
            // CRÍTICO: Aguarda o profile ser carregado ANTES de retornar
            // Isso garante que o redirecionamento tenha acesso ao role do usuário
            if (data.user) {
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/69870bc7-00ea-4f64-9298-033124960c3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3',location:'contexts/AuthContext.tsx:163',message:'before_fetch_profile',data:{userIdSuffix:data.user.id.slice(-4)},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                const profile = await fetchProfile(data.user.id);
                if (profile) {
                    setUser(profile);
                    return profile; // Retorna o profile para redirecionamento imediato
                }
            }
            return null;
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