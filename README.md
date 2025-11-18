# Next Checklist - Sistema de Controle de Paradas

Sistema completo de gerenciamento de paradas de manutenção, equipamentos e checklists para indústrias.

## 🚀 Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **NextAuth.js** - Autenticação
- **Tailwind CSS** - Estilização
- **MySQL** - Banco de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+ (local ou VPS)
- npm ou yarn

## 🔧 Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/marcelov7/next-check.git
cd next-check
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="mysql://user:password@localhost:3306/checklist"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. Execute as migrations do Prisma:
```bash
npx prisma migrate dev
```

5. (Opcional) Popule o banco com dados de teste:
```bash
npm run seed
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Credenciais padrão (após seed):**
- Email: `admin@checklist.local`
- Senha: `password`

## 🚀 Deploy na Vercel

### 1. Configurar Banco de Dados MySQL na Hostinger

1. Acesse o painel da Hostinger VPS
2. Crie um novo banco de dados MySQL
3. Anote as credenciais: host, porta, usuário, senha e nome do banco
4. Garanta que o IP da Vercel pode acessar o banco (ou libere IPs públicos)

### 2. Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marcelov7/next-check)

Ou via CLI:

```bash
# Instale a Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel, vá em **Settings > Environment Variables** e adicione:

```
DATABASE_URL=mysql://user:password@your-hostinger-ip:3306/database_name
NEXTAUTH_SECRET=your-super-secret-key-generate-with-openssl
NEXTAUTH_URL=https://your-app.vercel.app
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Executar Migrations em Produção

Após o primeiro deploy, execute as migrations:

```bash
# Localmente, apontando para o banco de produção
DATABASE_URL="mysql://..." npx prisma migrate deploy
```

Ou configure no package.json um script de build que execute as migrations automaticamente.

### 5. (Opcional) Popular Banco de Produção

```bash
DATABASE_URL="mysql://..." npm run seed
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Executar ESLint
npm run seed         # Popular banco com dados de teste
npx prisma studio    # Interface visual do banco
npx prisma migrate dev    # Criar nova migration
```

## 🔒 Segurança

- Nunca commite o arquivo `.env` com credenciais reais
- Use secrets fortes para `NEXTAUTH_SECRET`
- Configure SSL/TLS para conexão com MySQL em produção
- Implemente rate limiting em produção
- Revise as permissões do usuário MySQL

## 📝 Estrutura do Projeto

```
├── app/                    # Páginas e rotas Next.js
│   ├── api/               # API Routes
│   ├── components/        # Componentes React
│   ├── dashboard/         # Dashboard principal
│   ├── equipamentos/      # Gestão de equipamentos
│   ├── paradas/           # Gestão de paradas
│   └── ...
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   ├── seed.ts           # Script de seed
│   └── migrations/        # Migrations
└── lib/                   # Utilitários
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autor

Desenvolvido por [@marcelov7](https://github.com/marcelov7)

