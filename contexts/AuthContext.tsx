import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    sessionEvent: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionEvent, setSessionEvent] = useState<'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | null>(null);
    
    // Refs para prevenir race conditions
    const fetchProfileRef = useRef<Promise<User | null> | null>(null);
    const currentUserIdRef = useRef<string | null>(null);
    const isFetchingRef = useRef<boolean>(false);

    const fetchProfile = async (userId: string): Promise<User | null> => {
        // Prevenir múltiplas chamadas simultâneas para o mesmo usuário
        if ((fetchProfileRef.current && currentUserIdRef.current === userId) || 
            (isFetchingRef.current && currentUserIdRef.current === userId)) {
            return fetchProfileRef.current || Promise.resolve(null);
        }
        
        // Marcar como "em execução" antes de iniciar
        isFetchingRef.current = true;
        currentUserIdRef.current = userId;
        
        // Criar promise e armazenar no ref
        const profilePromise = (async () => {
            console.log('🔍 Iniciando busca de profile para:', userId);
            
            // Tentar buscar o profile
            console.log('📡 Executando query no Supabase...');
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            console.log('📥 Resposta do Supabase:', { 
                hasData: !!profile, 
                hasError: !!error,
                errorCode: error?.code,
                errorMessage: error?.message 
            });

            // Se o profile não existe, tentar criar (fallback se o trigger falhou)
            if (error || !profile) {
                console.warn('⚠️ Profile não encontrado, tentando criar...', error);
                if (error) {
                    console.error('❌ Error fetching profile:', {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    });
                }
                
                // Buscar dados do usuário autenticado
                console.log('👤 Buscando dados do auth user...');
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
                
                if (authError) {
                    console.error('❌ Erro ao buscar auth user:', authError);
                }
                
                if (authUser) {
                    console.log('✅ Auth user encontrado:', { id: authUser.id, email: authUser.email });
                    console.log('💾 Tentando criar profile...');
                    
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
                        console.error('❌ Erro ao criar profile:', {
                            message: createError.message,
                            code: createError.code,
                            details: createError.details,
                            hint: createError.hint
                        });
                        // Se ainda assim falhar, retornar um profile básico
                        console.log('🔄 Retornando profile básico (fallback)');
                        return {
                            id: userId,
                            email: authUser.email || '',
                            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'Usuário',
                            picture: authUser.user_metadata?.picture || authUser.user_metadata?.avatar_url || null,
                            role: 'CUSTOMER' as const,
                            createdAt: new Date().toISOString()
                        } as User;
                    }
                    console.log('✅ Profile criado com sucesso:', newProfile);
                    profile = newProfile;
                } else {
                    console.error('❌ Não foi possível obter dados do usuário autenticado');
                    return null;
                }
            } else {
                console.log('✅ Profile encontrado no banco:', { id: profile.id, email: profile.email, role: profile.role });
            }

            // Nota: A lógica de atualização de role foi movida para um trigger no banco
            // (scripts/EPIC_00_UPDATE_ROLE_ON_COMPANY_CREATE.sql)
            // O trigger atualiza automaticamente o role para 'COMPANY' quando uma empresa é criada

            // Validar que profile tem dados mínimos
            if (!profile.id) {
                console.error('❌ Profile sem id:', profile);
                return null;
            }

            const mappedUser = {
                id: profile.id,
                email: profile.email || '',
                name: profile.name || 'Usuário',
                picture: profile.picture || null,
                role: (profile.role || 'CUSTOMER') as 'ADMIN' | 'COMPANY' | 'CUSTOMER',
                createdAt: profile.created_at || new Date().toISOString()
            } as User;
            
            console.log('✅ Profile mapeado:', { 
                id: mappedUser.id, 
                email: mappedUser.email, 
                role: mappedUser.role,
                name: mappedUser.name
            });
            return mappedUser;
        })();
        
        // Armazenar promise no ref
        fetchProfileRef.current = profilePromise;
        
        try {
            const result = await profilePromise;
            return result;
        } finally {
            // Limpar referências após conclusão
            if (fetchProfileRef.current === profilePromise) {
                fetchProfileRef.current = null;
                isFetchingRef.current = false;
                if (currentUserIdRef.current === userId) {
                    currentUserIdRef.current = null;
                }
            }
        }
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
            
            // Atualizar evento de sessão para notificações
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                setSessionEvent(event);
                // Limpar evento após um tempo para permitir novas notificações
                setTimeout(() => setSessionEvent(null), 100);
            }
            
            if (session) {
                console.log('📥 Buscando profile para usuário:', session.user.id);
                const profile = await fetchProfile(session.user.id);
                if (profile) {
                    console.log('✅ Profile carregado:', { id: profile.id, email: profile.email, role: profile.role });
                    setUser(profile);
                } else {
                    console.error('❌ Profile não encontrado após SIGNED_IN');
                    setUser(null);
                }
            } else {
                console.log('🚪 Sessão encerrada');
                setUser(null);
            }
            setIsLoading(false);
            console.log('✅ Auth loading finalizado');
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
        <AuthContext.Provider value={{ user, isLoading, signInWithEmail, signUpWithEmail, logout, sessionEvent }}>
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