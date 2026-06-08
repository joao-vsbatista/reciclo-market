# 🌱 ReCicloMarket

Marketplace digital voltado à compra e venda de produtos usados com sistema de lances, desenvolvido como projeto acadêmico na **UNIFRAN — Universidade de Franca**.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://reciclo-market.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com)

---

## 📋 Sobre o Projeto

O **ReCicloMarket** é uma plataforma completa que permite aos usuários:

- Anunciar produtos usados via **leilão** (com sistema de lances) ou **venda direta** (preço fixo)
- Dar lances em produtos com valor em dinheiro e/ou troca por produtos do inventário
- Comprar produtos de preço fixo pelo carrinho com checkout completo (PIX, cartão, boleto)
- Conversar em tempo real com compradores e vendedores
- Gerenciar inventário de produtos para usar como moeda de troca

---

## 🚀 Funcionalidades

- ✅ Cadastro e autenticação de usuários
- ✅ Publicação de produtos (leilão ou venda direta)
- ✅ Sistema de lances com dinheiro e/ou troca por produto
- ✅ Countdown regressivo nos leilões
- ✅ Carrinho de compras e checkout (PIX, cartão de crédito, boleto)
- ✅ Chat em tempo real entre comprador e vendedor
- ✅ Inventário de produtos para troca
- ✅ Notificações em tempo real (lances, mensagens)
- ✅ Perfil público do vendedor com avaliações
- ✅ Moderação automática de imagens com IA (Claude)
- ✅ Filtros laterais por categoria, condição, estado e preço
- ✅ Busca de cidades via API do IBGE
- ✅ Zoom em imagens dos produtos
- ✅ Parcelamento exibido nos cards e páginas de produto
- ✅ Breadcrumbs nas páginas internas
- ✅ Contador animado de estatísticas na página inicial
- ✅ Dashboard completo com métricas e ações rápidas

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **Next.js 15** | Framework principal com App Router e SSR |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Tailwind CSS v4** | Estilização e responsividade |
| **shadcn/ui** | Componentes de interface |
| **Supabase** | Banco de dados, Auth, Storage e Realtime |
| **Anthropic Claude API** | Moderação automática de imagens |
| **date-fns** | Formatação e manipulação de datas |
| **API do IBGE** | Busca de cidades brasileiras |
| **Vercel** | Hospedagem e deploy contínuo |
| **Space Grotesk** | Tipografia do projeto |

---

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Chave de API do [Anthropic](https://console.anthropic.com)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/reciclomarket.git
cd reciclomarket
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
ANTHROPIC_API_KEY=sua-chave-anthropic
```

### 4. Configure o banco de dados

Execute os seguintes SQLs no **SQL Editor** do Supabase na ordem:

<details>
<summary>Ver SQL completo</summary>

```sql
-- Perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT, phone TEXT, city TEXT, state TEXT,
  bio TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  category TEXT NOT NULL, condition TEXT NOT NULL,
  min_price NUMERIC(10,2) NOT NULL,
  city TEXT, state TEXT,
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'auction',
  accepts_cash BOOLEAN DEFAULT true,
  accepts_trade BOOLEAN DEFAULT false,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  delivery_methods TEXT[] DEFAULT ARRAY['pickup'],
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imagens dos produtos
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL, is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lances
CREATE TABLE bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  message TEXT, cash_amount NUMERIC(10,2) DEFAULT 0,
  inventory_item_id UUID,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventário
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL, is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas e mensagens
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL, read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, title TEXT NOT NULL,
  body TEXT, read BOOLEAN DEFAULT FALSE, link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, product_id)
);

-- Carrinho e pedidos
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending',
  delivery_method TEXT DEFAULT 'pickup',
  delivery_address TEXT,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INT DEFAULT 1
);
```

</details>

### 5. Crie o bucket de imagens no Supabase

Em **Storage → New bucket**, crie um bucket chamado `product-images` com acesso **público**.

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
reciclomarket/
├── app/
│   ├── api/                  # Rotas de API (moderação de imagens)
│   ├── auth/                 # Login e cadastro
│   ├── carrinho/             # Carrinho de compras
│   ├── checkout/             # Checkout com pagamento
│   ├── dashboard/            # Área do usuário
│   ├── leiloes/              # Listagem de leilões
│   ├── pedido/               # Confirmação de pedido
│   ├── produtos/             # Páginas de produtos (leilão)
│   ├── vendas/               # Páginas de produtos (venda direta)
│   └── vendedor/             # Perfil público do vendedor
├── components/               # Componentes reutilizáveis
├── lib/
│   ├── supabase/             # Clientes Supabase (client/server)
│   ├── formatters.ts         # Funções de formatação
│   ├── types.ts              # Tipos TypeScript
│   └── utils.ts              # Utilitários
└── public/                   # Arquivos estáticos
```

---

## 👥 Autores

| Nome | GitHub |
|---|---|
| João Victor dos Santos Batista | [@joaovsb007](https://github.com/joaovsb007) |
| Kayk Alves Goulart | [@kayk](https://github.com/kaykgoulart9-png) |

---

## 🎓 Informações Acadêmicas

- **Curso:** Análise e Desenvolvimento de Sistemas
- **Instituição:** UNIFRAN — Universidade de Franca
- **Ano:** 2026

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.
