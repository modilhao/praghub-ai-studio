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
  console.error('💡 Você precisa da Service Role Key do Supabase para migrar empresas.');
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

/**
 * Converte um objeto Company (camelCase) para o formato do banco (snake_case)
 */
function convertCompanyToDbFormat(company) {
  const dbData = {
    slug: company.slug,
    name: company.name,
    rating: company.rating || 0,
    reviews: company.reviews || 0,
    location: company.location || '',
    short_location: company.shortLocation || '',
    description: company.description || null,
    cep: company.cep || null,
    street: company.street || null,
    number: company.number || null,
    neighborhood: company.neighborhood || null,
    city: company.city || null,
    state: company.state || null,
    tags: company.tags || [],
    specialties: company.specialties || [],
    image_url: company.imageUrl || null,
    whatsapp: company.whatsapp || null,
    is_premium: company.isPremium || false,
    status: company.status || 'Pendente'
  };
  
  // Só incluir cnpj se a coluna existir na tabela
  // (removido temporariamente pois a coluna não existe no banco)
  // if (company.cnpj) {
  //   dbData.cnpj = company.cnpj;
  // }
  
  return dbData;
}

/**
 * Carrega empresas do arquivo TypeScript
 * Tenta importar diretamente, se falhar, tenta parsear o arquivo
 */
async function loadCompanies() {
  // Primeiro, tentar importar diretamente (pode funcionar com tsx ou se o ambiente suportar)
  try {
    const companiesModule = await import('../src/data/companies.ts');
    if (companiesModule && companiesModule.COMPANIES) {
      console.log('✅ Empresas carregadas via import direto\n');
      return companiesModule.COMPANIES;
    }
  } catch (importError) {
    // Se falhar, tentar ler e parsear o arquivo manualmente
    console.log('⚠️  Import direto falhou, tentando parsear arquivo...\n');
  }

  // Abordagem alternativa: ler o arquivo e usar eval controlado
  const companiesPath = join(__dirname, '../src/data/companies.ts');
  
  if (!existsSync(companiesPath)) {
    throw new Error(`Arquivo não encontrado: ${companiesPath}`);
  }

  const fileContent = readFileSync(companiesPath, 'utf-8');
  
  // Extrair apenas o array de objetos (remover imports e export)
  // Procurar pelo padrão: export const COMPANIES: Company[] = [...]
  const arrayMatch = fileContent.match(/export const COMPANIES[^=]*=\s*(\[[\s\S]*\]);/);
  
  if (!arrayMatch) {
    throw new Error('Não foi possível encontrar o array COMPANIES no arquivo');
  }

  const arrayString = arrayMatch[1];
  
  // Criar um contexto isolado para eval (mais seguro)
  // Converter o código TypeScript para JavaScript válido
  const jsCode = `
    const companies = ${arrayString};
    companies;
  `;
  
  // Executar em um contexto isolado
  const companies = eval(jsCode);
  
  if (!Array.isArray(companies)) {
    throw new Error('Dados parseados não são um array válido');
  }

  console.log('✅ Empresas carregadas via parse do arquivo\n');
  return companies;
}

async function migrateCompanies() {
  console.log('🚀 Iniciando migração de empresas para o Supabase...\n');
  
  let companies;
  try {
    companies = await loadCompanies();
  } catch (error) {
    console.error('❌ Erro ao carregar empresas:', error.message);
    console.error('\n💡 Soluções possíveis:');
    console.error('   1. Instale tsx: npm install -D tsx');
    console.error('   2. Execute com tsx: npx tsx scripts/migrate-companies.js');
    console.error('   3. Ou converta src/data/companies.ts para JSON e ajuste o script');
    process.exit(1);
  }
  
  console.log(`📊 Total de empresas a migrar: ${companies.length}\n`);

  let successCount = 0;
  let updateCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Processar cada empresa
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const dbData = convertCompanyToDbFormat(company);

      try {
        // Verificar se a empresa já existe (por slug)
        const { data: existing, error: checkError } = await supabaseAdmin
          .from('companies')
          .select('slug')
          .eq('slug', company.slug)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = não encontrado (isso é esperado para novas empresas)
          throw checkError;
        }

        if (existing) {
          // Empresa já existe, atualizar
          console.log(`🔄 [${i + 1}/${companies.length}] Atualizando: ${company.name}`);
          const { error: updateError } = await supabaseAdmin
            .from('companies')
            .update(dbData)
            .eq('slug', company.slug);

          if (updateError) {
            throw updateError;
          }

          updateCount++;
          console.log(`   ✅ Atualizada com sucesso!\n`);
        } else {
          // Empresa não existe, inserir
          console.log(`➕ [${i + 1}/${companies.length}] Inserindo: ${company.name}`);
          const { error: insertError } = await supabaseAdmin
            .from('companies')
            .insert(dbData);

          if (insertError) {
            throw insertError;
          }

          successCount++;
          console.log(`   ✅ Inserida com sucesso!\n`);
        }
      } catch (error) {
        errorCount++;
        const errorMsg = `Erro ao processar ${company.name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}\n`);
      }
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Empresas inseridas: ${successCount}`);
    console.log(`🔄 Empresas atualizadas: ${updateCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📦 Total processado: ${companies.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERROS ENCONTRADOS:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (errorCount === 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros. Verifique os detalhes acima.');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal durante a migração:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateCompanies();
