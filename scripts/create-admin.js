import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tentar carregar dotenv se disponível
let dotenv;
try {
  dotenv = await import('dotenv');
  const envPath = join(__dirname, '../.env.local');
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
  const envPath2 = join(__dirname, '../.env');
  if (existsSync(envPath2)) {
    dotenv.config({ path: envPath2 });
  }
} catch (e) {
  // dotenv não instalado, usar apenas process.env
}

let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Se não tiver as variáveis, tentar ler do arquivo .env.local
if (!supabaseUrl || !supabaseServiceKey) {
  const envLocalPath = join(__dirname, '../.env.local');
  if (existsSync(envLocalPath)) {
    const envContent = readFileSync(envLocalPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (key === 'VITE_SUPABASE_URL' && !supabaseUrl) {
          supabaseUrl = value;
        }
        if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !supabaseServiceKey) {
          supabaseServiceKey = value;
        }
      }
    });
  }
}

if (!supabaseUrl) {
  console.error('❌ Erro: VITE_SUPABASE_URL não encontrado');
  console.error('💡 Configure uma das opções:');
  console.error('   1. Variável de ambiente: VITE_SUPABASE_URL');
  console.error('   2. Arquivo .env.local com: VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrado');
  console.error('💡 Você precisa da Service Role Key do Supabase para criar usuários.');
  console.error('   Encontre ela em: Supabase Dashboard > Settings > API > service_role (secret)');
  console.error('   Configure uma das opções:');
  console.error('   1. Variável de ambiente: SUPABASE_SERVICE_ROLE_KEY');
  console.error('   2. Arquivo .env.local com: SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui');
  process.exit(1);
}

// Criar cliente admin (com service_role_key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@praghub.com';
const ADMIN_PASSWORD = 'password';

async function createAdminUser() {
  console.log('🚀 Criando usuário admin no Supabase...\n');

  try {
    // 1. Verificar se o usuário já existe
    console.log('📋 Verificando se o usuário já existe...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL);
    
    if (existingUser) {
      console.log(`✅ Usuário ${ADMIN_EMAIL} já existe (ID: ${existingUser.id})`);
      
      // Verificar se já tem perfil admin
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar perfil:', profileError.message);
        throw profileError;
      }

      if (profile && profile.role === 'admin') {
        console.log('✅ Perfil admin já está configurado!');
        console.log('\n📝 Credenciais:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Senha: ${ADMIN_PASSWORD}`);
        return;
      }

      // Atualizar ou criar perfil admin
      console.log('🔄 Atualizando perfil para admin...');
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: existingUser.id,
          role: 'admin'
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error('❌ Erro ao atualizar perfil:', upsertError.message);
        throw upsertError;
      }

      console.log('✅ Perfil admin criado/atualizado com sucesso!');
      console.log('\n📝 Credenciais:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Senha: ${ADMIN_PASSWORD}`);
      return;
    }

    // 2. Criar novo usuário
    console.log('👤 Criando novo usuário admin...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        role: 'admin'
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Usuário não foi criado');
    }

    console.log(`✅ Usuário criado com sucesso! (ID: ${newUser.user.id})`);

    // 3. Criar perfil admin
    console.log('📝 Criando perfil admin...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        role: 'admin'
      });

    if (profileError) {
      // Se der erro, pode ser que o trigger já tenha criado o perfil
      console.log('⚠️  Aviso ao criar perfil:', profileError.message);
      console.log('🔄 Tentando atualizar perfil existente...');
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', newUser.user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError.message);
        throw updateError;
      }
    }

    console.log('✅ Perfil admin criado com sucesso!');
    console.log('\n🎉 Usuário admin criado com sucesso!');
    console.log('\n📝 Credenciais:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}`);
    console.log('\n💡 Você pode fazer login agora na aplicação!');

  } catch (error) {
    console.error('\n❌ Erro ao criar usuário admin:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdminUser();

