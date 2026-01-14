import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription, useEntitlements } from '../contexts/SubscriptionContext';
import { createCheckoutSession } from '../lib/stripe-client';
import { Toast } from '../components/Toast';
import type { Plan } from '../types';

// ATUALIZADO: Preços correspondem aos Price IDs reais do Stripe (Janeiro 2025)
// Nota: Se quiser alterar os preços, crie novos Prices no Stripe e atualize os Price IDs
const PLANS: Plan[] = [
  {
    key: 'directory',
    name: 'Diretório',
    description: 'Para empresas que querem aparecer e começar a gerar oportunidades',
    price: 149.00, // Corresponde a price_1SpTBFJULNOvBzJ46Hf2TCJK (TESTE)
    priceId: 'price_1SpTBFJULNOvBzJ46Hf2TCJK',
    idealFor: [
      'Quer ser encontrado por clientes na sua região',
      'Precisa de uma presença digital profissional sem complicação',
      'Quer receber leads sem depender apenas de indicações',
    ],
    features: [
      'Perfil completo e otimizado no diretório PragHub',
      'Visibilidade para milhares de clientes em busca de serviços',
      'Recebimento direto de leads qualificados',
      'Estatísticas de visualização e contato',
      'Atualizações ilimitadas do perfil',
    ],
    tip: 'É o primeiro passo para sair do invisível e entrar no jogo.',
    cta: 'Quero começar a aparecer',
  },
  {
    key: 'directory_academy',
    name: 'Diretório + Academia',
    description: 'Para empresas que querem crescer com conhecimento e estratégia',
    price: 249.00, // Corresponde a price_1SpTBGJULNOvBzJ4ZEmSu0zk (TESTE)
    priceId: 'price_1SpTBGJULNOvBzJ4ZEmSu0zk',
    idealFor: [
      'Já entende a importância da visibilidade',
      'Quer se diferenciar da concorrência',
      'Busca aprender o que realmente funciona no mercado',
    ],
    features: [
      'Tudo do Plano Diretório',
      'Acesso completo à Academia de Vídeos',
      'Treinamentos práticos e atualizados',
      'Conteúdo exclusivo focado em vendas, gestão e crescimento',
      'Certificados de conclusão (autoridade e profissionalização)',
    ],
    tip: 'Aqui você não só aparece — você evolui.',
    cta: 'Quero crescer com estratégia',
  },
  {
    key: 'premium',
    name: 'Premium',
    description: 'Para empresas que querem estrutura, autoridade e crescimento acelerado',
    price: 479.00, // Corresponde a price_1SpTBGJULNOvBzJ4P3WdhYfN (TESTE)
    priceId: 'price_1SpTBGJULNOvBzJ4P3WdhYfN',
    popular: true,
    idealFor: [
      'Quer se posicionar como referência no mercado',
      'Entende que presença digital profissional gera confiança',
      'Busca resultados mais rápidos e consistentes',
    ],
    features: [
      'Tudo do Diretório + Academia',
      'Site profissional básico incluso (valor real superior a R$ 1.500)',
      'Descontos exclusivos em produtos e soluções premium',
      'Suporte prioritário',
      'Badge Premium destacado no perfil',
      'Análise personalizada de performance',
      'Consultoria mensal de crescimento',
    ],
    tip: 'É o plano para quem decidiu levar o negócio a sério.',
    cta: 'Quero o plano completo',
  },
];

export function Planos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { subscription, refresh } = useSubscription();
  const entitlements = useEntitlements();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const upgradeParam = searchParams.get('upgrade');
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    // Verifica se veio do checkout com sucesso
    if (sessionId && searchParams.get('success') === 'true') {
      setToast({
        message: 'Pagamento processado com sucesso! Sincronizando sua assinatura...',
        type: 'success',
      });
      // Sincroniza subscription e redireciona
      refresh()
        .then(() => {
          setTimeout(() => {
            // Usa navigate sem hash - HashRouter adiciona automaticamente
            navigate('/dashboard');
          }, 2000);
        })
        .catch((error) => {
          console.error('Erro ao sincronizar subscription:', error);
          setToast({
            message: 'Pagamento processado, mas houve um erro ao sincronizar. Use o botão "Sincronizar" no dashboard.',
            type: 'error',
          });
        });
    }

    // Verifica se checkout foi cancelado
    if (canceled === 'true') {
      setToast({
        message: 'Checkout cancelado. Você pode tentar novamente quando quiser.',
        type: 'info',
      });
    }

    // Limpa parâmetros da URL após processar
    if (sessionId || canceled) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('session_id');
      newSearchParams.delete('success');
      newSearchParams.delete('canceled');
      // Usa navigate sem hash - HashRouter adiciona automaticamente
      navigate(`/planos?${newSearchParams.toString()}`, { replace: true });
    }
  }, [sessionId, canceled, navigate, refresh, searchParams]);

  const handleSubscribe = async (planKey: 'directory' | 'directory_academy' | 'premium') => {
    if (!user) {
      navigate('/login?redirect=/planos');
      return;
    }

    setIsLoading(planKey);
    setToast(null);

    try {
      const { url } = await createCheckoutSession(planKey);
      // Redireciona para o Stripe Hosted Checkout
      window.location.href = url;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setToast({
        message: err.message || 'Erro ao iniciar checkout. Tente novamente.',
        type: 'error',
      });
      setIsLoading(null);
    }
  };

  /**
   * Verifica se o usuário já tem entitlement ativo para o plano
   */
  const hasActiveEntitlement = (planKey: 'directory' | 'directory_academy' | 'premium'): boolean => {
    if (!subscription) return false;
    
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    if (!isActive) return false;

    // Verifica se o plano atual já cobre o entitlement necessário
    switch (planKey) {
      case 'directory':
        return entitlements.directoryAccess && subscription.planKey === 'directory';
      case 'directory_academy':
        return entitlements.academyAccess && 
               (subscription.planKey === 'directory_academy' || subscription.planKey === 'premium');
      case 'premium':
        return entitlements.premiumDiscounts && subscription.planKey === 'premium';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark py-12 px-4">
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        isVisible={!!toast}
        onClose={() => setToast(null)}
        duration={toast?.type === 'error' ? 6000 : 4000}
      />

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight max-w-5xl mx-auto">
            Escolha o Plano Ideal para Fazer sua Empresa Aparecer, Vender Mais e Crescer com Previsibilidade
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-4">
            Você não precisa de mais redes sociais, anúncios caros ou promessas vazias.
          </p>
          <p className="text-white text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-8 font-medium">
            Você precisa de visibilidade certa, para o público certo, com ferramentas que transformam presença digital em leads reais.
          </p>
          <div className="inline-block mb-6 p-4 bg-primary/10 border border-primary/30 rounded-2xl">
            <p className="text-white text-lg font-semibold mb-2">🚀 O PragHub foi criado para empresas de controle de pragas que querem crescer com método, profissionalismo e autoridade.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary mb-12">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">check_circle</span>
              <span className="font-medium">Sem fidelidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">check_circle</span>
              <span className="font-medium">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">check_circle</span>
              <span className="font-medium">Plataforma validada no mercado</span>
            </div>
          </div>
        </div>

        {/* Subheadline - Clareza Estratégica */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="p-8 bg-card-dark/50 rounded-3xl border border-card-border">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              O PragHub não é apenas um diretório.
            </h2>
            <p className="text-xl text-text-secondary mb-6 text-center">
              É um ecossistema de crescimento, onde sua empresa:
            </p>
            <ul className="space-y-4 max-w-2xl mx-auto">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-1">arrow_forward</span>
                <span className="text-lg text-slate-200">passa a ser encontrada por quem realmente está procurando</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-1">arrow_forward</span>
                <span className="text-lg text-slate-200">se posiciona como referência no seu mercado</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-1">arrow_forward</span>
                <span className="text-lg text-slate-200">aprende, evolui e se diferencia da concorrência</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Prova Social */}
        <div className="mb-16 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Empresas que crescem não dependem de sorte. Dependem de método.
          </h2>
          <p className="text-lg text-text-secondary mb-6">
            Centenas de empresas já utilizam o PragHub para:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-card-dark/30 rounded-xl border border-card-border">
              <span className="text-primary font-semibold">•</span> aumentar visibilidade regional
            </div>
            <div className="p-4 bg-card-dark/30 rounded-xl border border-card-border">
              <span className="text-primary font-semibold">•</span> receber contatos mais qualificados
            </div>
            <div className="p-4 bg-card-dark/30 rounded-xl border border-card-border">
              <span className="text-primary font-semibold">•</span> profissionalizar sua presença digital
            </div>
            <div className="p-4 bg-card-dark/30 rounded-xl border border-card-border">
              <span className="text-primary font-semibold">•</span> estruturar crescimento de médio e longo prazo
            </div>
          </div>
        </div>

        {/* Seção: Qual plano faz sentido para você? */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Qual plano faz sentido para você?
          </h2>
          <p className="text-text-secondary text-lg">
            Escolha o que melhor se encaixa no seu momento atual
          </p>
        </div>

        {upgradeParam && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              <p>Upgrade seu plano para acessar esta funcionalidade.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => {
            const hasActive = hasActiveEntitlement(plan.key);
            const isCurrentPlan = subscription?.planKey === plan.key && 
                                 (subscription.status === 'active' || subscription.status === 'trialing');
            const isUpgrade = subscription && 
              (plan.key === 'premium' || 
               (plan.key === 'directory_academy' && subscription.planKey === 'directory'));

            return (
              <div
                key={plan.key}
                data-plan={plan.key}
                className={`relative p-8 rounded-3xl border-2 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-br from-card-dark via-card-dark to-primary/5 border-primary shadow-2xl shadow-primary/30 scale-105 ring-2 ring-primary/20'
                    : 'bg-card-dark border-card-border hover:border-primary/50 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="px-5 py-2 bg-gradient-to-r from-primary to-blue-500 text-white text-sm font-bold rounded-full shadow-lg shadow-primary/50 animate-pulse">
                      Melhor Valor
                    </span>
                  </div>
                )}

                {hasActive && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                      Ativo
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-3xl font-bold mb-3 ${
                    plan.popular 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400' 
                      : 'text-white'
                  }`}>
                    {plan.name === 'Premium' ? '🟦 Plano Premium' : `🟦 Plano ${plan.name}`}
                    {plan.popular && <span className="block text-sm text-primary mt-1">(Mais escolhido)</span>}
                  </h3>
                  <p className="text-text-secondary mb-4 text-base font-medium">{plan.description}</p>
                  
                  {/* Ideal para */}
                  <div className="mb-4 p-3 bg-card-dark/50 rounded-lg border border-card-border">
                    <p className="text-xs font-semibold text-primary mb-2">Ideal se você:</p>
                    <ul className="space-y-1">
                      {plan.idealFor?.map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-baseline mb-2">
                    <span className={`text-6xl font-extrabold ${
                      plan.popular ? 'text-primary' : 'text-white'
                    }`}>
                      R$ {plan.price.toFixed(0)}
                    </span>
                    <span className="text-text-secondary ml-2 text-lg">/mês</span>
                  </div>
                  {plan.popular && (
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-xs text-primary font-semibold">
                        💰 Economize R$ 1.500+ com site incluso
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-primary mb-3">O que você recebe:</p>
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-primary' : 'text-green-400'
                        }`}>
                          {plan.popular && idx === 0 ? 'star' : 'check_circle'}
                        </span>
                        <span className={`text-sm leading-relaxed ${
                          plan.popular ? 'text-white font-medium' : 'text-slate-200'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.tip && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-400 font-medium">
                        💡 {plan.tip}
                      </p>
                    </div>
                  )}
                </div>

                {hasActive || isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full px-6 py-3.5 bg-card-border/50 text-text-secondary rounded-xl cursor-not-allowed font-semibold border border-card-border"
                  >
                    {isCurrentPlan ? 'Plano Atual' : 'Já Incluído'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={isLoading === plan.key || !!isLoading}
                    className={`w-full px-6 py-3.5 rounded-xl font-bold transition-all ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30'
                        : 'bg-card-border text-white hover:bg-card-border/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
                  >
                    {isLoading === plan.key
                      ? 'Processando...'
                      : isUpgrade
                      ? 'Fazer Upgrade'
                      : plan.cta || 'Assinar Agora'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bloco de Ancoragem de Valor */}
        <div className="mt-16 mb-16 max-w-4xl mx-auto">
          <div className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl border-2 border-red-500/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Quanto custa não ter uma presença profissional?
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-card-dark/50 rounded-xl border border-red-500/20">
                <span className="text-red-400 font-semibold">•</span> Perder clientes para concorrentes mais visíveis
              </div>
              <div className="p-4 bg-card-dark/50 rounded-xl border border-red-500/20">
                <span className="text-red-400 font-semibold">•</span> Depender apenas de indicações
              </div>
              <div className="p-4 bg-card-dark/50 rounded-xl border border-red-500/20">
                <span className="text-red-400 font-semibold">•</span> Não saber de onde vêm seus contatos
              </div>
              <div className="p-4 bg-card-dark/50 rounded-xl border border-red-500/20">
                <span className="text-red-400 font-semibold">•</span> Ter uma imagem amadora no digital
              </div>
            </div>
            <p className="text-center text-xl font-bold text-white">
              O PragHub custa menos que um único cliente perdido por mês.
            </p>
          </div>
        </div>

        {/* Redução de Risco */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="p-8 bg-card-dark/50 rounded-3xl border border-card-border">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Você não corre risco algum
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 p-4 bg-card-dark rounded-xl">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <span className="text-slate-200">Pagamentos processados pelo Stripe (segurança global)</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card-dark rounded-xl">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <span className="text-slate-200">Cancele quando quiser, sem multas</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card-dark rounded-xl">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <span className="text-slate-200">Sem contratos longos</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card-dark rounded-xl">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <span className="text-slate-200">Sem taxas ocultas</span>
              </div>
            </div>
            <p className="text-center text-lg text-text-secondary">
              Se não fizer sentido para você, basta cancelar.
            </p>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mb-16 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar sua presença digital em crescimento real?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Escolha o plano que faz sentido para o seu momento
            e comece hoje a construir uma empresa mais visível, profissional e preparada para crescer.
          </p>
          <button
            onClick={() => {
              const premiumCard = document.querySelector('[data-plan="premium"]');
              if (premiumCard) {
                premiumCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            👉 Escolher meu plano agora
          </button>
        </div>

        {/* Assinatura Atual (se houver) */}
        {subscription && (
          <div className="mt-12 p-6 bg-card-dark rounded-2xl border border-card-border max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">subscriptions</span>
              Sua Assinatura Atual
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Plano:</span>
                <span className="font-semibold text-white">
                  {subscription.planKey === 'directory' ? 'Diretório' :
                   subscription.planKey === 'directory_academy' ? 'Diretório + Academia' :
                   'Premium'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className={`font-semibold ${
                  subscription.status === 'active' ? 'text-green-400' :
                  subscription.status === 'trialing' ? 'text-blue-400' :
                  subscription.status === 'past_due' ? 'text-yellow-400' :
                  subscription.status === 'canceled' ? 'text-red-400' :
                  'text-text-secondary'
                }`}>
                  {subscription.status === 'active' ? 'Ativa' :
                   subscription.status === 'trialing' ? 'Período de Teste' :
                   subscription.status === 'past_due' ? 'Pagamento Pendente' :
                   subscription.status === 'canceled' ? 'Cancelada' :
                   subscription.status}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Próxima renovação:</span>
                  <span className="font-semibold text-white">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
