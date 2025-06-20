# 🚀 Comando Final para Claude Code - Blueprint Pro (Vercel + Neon)

## 📋 Checklist Pré-Início

Confirme que tens:
- ✅ WSL Ubuntu instalado e funcionando
- ✅ Node.js 20+ (`node --version`)
- ✅ MCPs ativos: Neon, Vercel, Context7
- ✅ Arquivos em `C:\Users\Bilal\Documents\aiparati\Nuno\blueprint-pro-mcp\`

## 🎯 COMANDO INICIAL COMPLETO

```text
Por favor, navegue para C:\Users\Bilal\Documents\aiparati\Nuno\blueprint-pro-mcp\ e siga o arquivo claude-code-autonomous-setup.md para criar o Blueprint Pro MVP completo. 

IMPORTANTE:
- Use NEON MCP para criar database PostgreSQL (FREE tier)
- Use VERCEL MCP para hosting e deploy (FREE tier) 
- Use Context7 MCP para buscar documentação atualizada
- Trabalhe de forma 100% autónoma com parallel tooling
- Quando encontrar erros: use ultra think → documente em error-learning.md → resolva → continue
- Teste SEMPRE conexão database ↔ frontend antes de prosseguir
- O MVP deve ter TODAS as funcionalidades do mockup HTML

Stack: Next.js 15.4 + TypeScript + Tailwind + Neon + Prisma + Clerk + Vercel

Comece criando o database no Neon FREE tier, depois o projeto Next.js, e siga implementando todos os 7 módulos até o deploy final no Vercel.
```

## 🔧 Sequência de Execução

### 1️⃣ Setup Neon Database (5 min)
```bash
# Via Neon MCP
neon:create_project name="blueprint-pro" region="aws-eu-central-1"
# Guardar: PROJECT_ID, DATABASE_URL (pooled), DIRECT_DATABASE_URL
```

### 2️⃣ Criar Projeto Next.js (10 min)
```bash
cd /mnt/c/Users/Bilal/Documents/aiparati/Nuno
npx create-next-app@latest blueprint-pro --typescript --tailwind --app --src-dir
cd blueprint-pro
```

### 3️⃣ Instalar Dependências (5 min)
```bash
# Database + Neon
npm install @prisma/client prisma @neon-tech/serverless @prisma/adapter-neon

# Auth + UI + Features
npm install @clerk/nextjs zustand @tanstack/react-query react-hook-form zod
npm install recharts html5-qrcode next-intl uploadthing lucide-react
npm install tailwind-merge clsx date-fns

# Radix UI
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs
```

### 4️⃣ Configurar Ambiente (.env.local)
```env
# Neon Database
DATABASE_URL="postgresql://...@...neon.tech/blueprint-pro?sslmode=require&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://...@...neon.tech/blueprint-pro?sslmode=require"

# Vercel
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk (criar conta e pegar keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Uploadthing (criar conta e pegar keys)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
```

### 5️⃣ Desenvolvimento (Semanas 1-4)
- Layout com cores IMASD (#1B4F72 e #F39C12)
- Todos os 7 módulos do mockup
- Multi-idioma (EN/ES/PT)
- Testes de integração

### 6️⃣ Deploy Vercel (30 min)
```bash
# Via Vercel MCP
vercel:create_project name="blueprint-pro"
vercel:link
vercel:env add [todas as variáveis]
vercel --prod
```

## 📊 Monitoramento FREE Tier

### Neon (manter < 0.5GB)
```sql
-- Verificar uso
SELECT pg_database_size('blueprint_pro_db') / 1024 / 1024 as size_mb;
```

### Vercel (manter < 100GB bandwidth)
- Dashboard: vercel.com/dashboard
- Analytics incluído no FREE tier

## 🎨 Cores IMASD para UI

```css
:root {
  --primary: #1B4F72;      /* Azul IMASD */
  --secondary: #F39C12;    /* Laranja/Dourado */
  --success: #2ECC71;      /* Verde */
  --background: #F8F9FA;   /* Cinza claro */
  --text: #2C3E50;         /* Cinza escuro */
}
```

## ✅ Funcionalidades Obrigatórias

### Módulos (7 total)
1. **Dashboard** - Cards resumo + 2 gráficos
2. **Projects** - CRUD completo + imagens
3. **Work Orders** - Hierarquia Assembly→Parts
4. **Tasks** - Filtros múltiplos
5. **Operations** - 7 tipos + time tracking
6. **Quality Control** - QR scan + fotos
7. **Settings/Profile** - Multi-idioma

### Features Especiais
- ⏱️ Multi-timer simultâneo
- 📱 QR code scanning
- 🖼️ Upload grid de imagens
- 🌍 3 idiomas (EN/ES/PT)
- 📊 Gráficos interativos
- 🎨 20+ status badges

## 🚨 Se Algo Falhar

### Erro Neon Connection
```bash
# Verificar SSL
# URL deve ter: ?sslmode=require&pgbouncer=true

# Testar conexão
npx prisma db pull
```

### Erro Vercel Build
```bash
# Build command correto
"build": "prisma generate && prisma db push && next build"

# Verificar logs
vercel logs --since 1h
```

### Reset Total
```bash
cd /mnt/c/Users/Bilal/Documents/aiparati/Nuno
rm -rf blueprint-pro
# Recomeçar com learnings
```

## 🎯 Resultado Final Esperado

Uma aplicação:
- ✅ 100% funcional (todos os módulos)
- ✅ Visual profissional IMASD
- ✅ Performance < 2s load
- ✅ FREE nos primeiros 3-6 meses
- ✅ Pronta para escalar
- ✅ Zero bugs críticos

**SUCESSO = Nuno Pires impressionado! 🚀**