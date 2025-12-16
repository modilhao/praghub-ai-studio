import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  role: 'admin' | 'company' | 'consumer';
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  sessionEvent: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionEvent, setSessionEvent] = useState<'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | null>(null);
  const fetchProfileRef = useRef<Promise<void> | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchProfile = async (userId: string) => {
    // Prevenir múltiplas chamadas simultâneas para o mesmo usuário
    // Verificar tanto o ref da promise quanto o flag síncrono
    if ((fetchProfileRef.current && currentUserIdRef.current === userId) || (isFetchingRef.current && currentUserIdRef.current === userId)) {
      return fetchProfileRef.current || Promise.resolve();
    }
    
    // Marcar imediatamente (síncrono) para prevenir outras chamadas
    isFetchingRef.current = true;
    currentUserIdRef.current = userId;
    
    // Criar e atribuir a promise ANTES de iniciar a execução para prevenir race conditions
    const profilePromise = (async () => {
    try {
      setLoading(true);
      
      // Timeout de segurança para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      // Primeiro tentar buscar apenas id e role (campos essenciais)
      const supabaseQuery = supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([supabaseQuery, timeoutPromise]) as any;

      if (error) {
        // Se não encontrou perfil, tentar usar metadata
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.user_metadata?.role) {
          setProfile({
            id: userId,
            role: currentUser.user_metadata.role
          });
        } else {
          setProfile(null);
        }
      } else if (data) {
        // Criar profile apenas com os campos que existem
        // Não buscar full_name e avatar_url pois essas colunas não existem na tabela
        setProfile({
          id: data.id,
          role: data.role
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Fallback para metadata em caso de erro
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.user_metadata?.role) {
          setProfile({
            id: userId,
            role: currentUser.user_metadata.role
          });
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('AuthContext: Error in fallback', e);
        setProfile(null);
      }
    } finally {
      setLoading(false);
      // Limpar referência quando completar
      if (fetchProfileRef.current === profilePromise) {
        fetchProfileRef.current = null;
        isFetchingRef.current = false;
        if (currentUserIdRef.current === userId) {
          currentUserIdRef.current = null;
        }
      }
    }
    })();
    
    // Atribuir a promise ao ref IMEDIATAMENTE para prevenir race conditions
    fetchProfileRef.current = profilePromise;
    return profilePromise;
  };

  useEffect(() => {
    let mounted = true;
    
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('AuthContext: Error getting session', error);
      if (mounted) {
        setLoading(false);
      }
    });

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        // Atualizar evento de sessão para notificações
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSessionEvent(event);
          // Limpar evento após um tempo para permitir novas notificações
          setTimeout(() => setSessionEvent(null), 100);
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, sessionEvent }}>
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

