# PM Frameworks Analyzer

## 📊 Análise Crítica de Frameworks para Product Managers

O PM Frameworks Analyzer é uma aplicação full-stack que permite a análise crítica de frameworks de gerenciamento de projetos e produtos. A aplicação combina uma interface moderna em React com um backend Express para fornecer uma experiência completa de análise e geração de relatórios PDF.

## 🌟 Recursos

- **Análise de Frameworks**: Avaliação detalhada de frameworks de gerenciamento de projetos
- **Interface Moderna**: UI/UX desenvolvida com React e componentes acessíveis
- **Geração de PDF**: Relatórios profissionais em PDF com gráficos e formatação
- **Análise de Forças e Fraquezas**: Identificação de pontos fortes e lacunas nos frameworks
- **Recomendações Personalizadas**: Sugestões baseadas na análise do framework
- **Design Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- Lucide React Icons
- TanStack Query (React Query)

### Backend
- Node.js
- Express
- TypeScript
- Playwright (para geração de PDF)

### Banco de Dados
- Atualmente: Memória (MemStorage) — usado por padrão em desenvolvimento; dados são voláteis e reiniciam ao reiniciar o servidor.
- Recomendado: PostgreSQL (via Neon Serverless) com Drizzle ORM para persistência em produção.
- Para habilitar PostgreSQL: defina DATABASE_URL no arquivo .env e execute `npm run db:push` para aplicar migrations.
- Zod (validação de esquemas) continua sendo utilizado para validação de entrada.

### Outras Ferramentas
- Vite (empacotamento e desenvolvimento)
- Tailwind CSS (estilização)
- Recharts (gráficos)
- Framer Motion (animações)

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- PostgreSQL (ou acesso a uma instância online)

### Instalação

1. Clone este repositório:
```bash
git clone https://github.com/jhonnybrzz1/PMframeworks.git
```

2. Instale as dependências:
```bash
cd PMframeworks
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
DATABASE_URL="sua_string_de_conexao_postgresql"
```

4. Execute a aplicação em modo de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000` (ou na porta especificada na variável `PORT`).

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento com hot-reload
- `npm run build` - Compila a aplicação para produção
- `npm run start` - Inicia a aplicação em modo de produção
- `npm run check` - Executa a verificação de tipos TypeScript
- `npm run test` - Executa os testes com Vitest
- `npm run db:push` - Atualiza o banco de dados com as últimas migrações do Drizzle

## 📁 Estrutura do Projeto

```
├── client/                 # Código-fonte do frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   ├── hooks/              # Hooks personalizados
│   ├── lib/                # Bibliotecas e utilitários
│   ├── types/              # Tipos TypeScript
│   ├── index.css          # Estilos globais
│   └── main.tsx           # Ponto de entrada do React
├── server/                 # Código-fonte do backend Express
│   ├── index.ts           # Ponto de entrada do servidor
│   ├── routes.ts          # Definição de rotas da API
│   ├── reports/           # Templates e lógica de geração de relatórios
│   └── storage.ts         # Lógica de armazenamento
├── shared/                 # Código compartilhado entre cliente e servidor
├── attached_assets/       # Recursos estáticos
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração do TypeScript
├── tailwind.config.ts     # Configuração do Tailwind CSS
└── vite.config.ts         # Configuração do Vite
```

## 📊 Funcionalidades

1. **Análise de Frameworks**: Insira informações sobre um framework de gerenciamento de projetos
2. **Visualização de Resultados**: Visualize forças, fraquezas e recomendações
3. **Geração de PDF**: Exporte a análise completa em formato PDF profissional
4. **Interface Intuitiva**: Design limpo e responsivo para fácil navegação

## 🎯 Casos de Uso

- Avaliação de frameworks ágeis (Scrum, Kanban, etc.)
- Análise comparativa de metodologias de gerenciamento de projetos
- Geração de relatórios para stakeholders
- Documentação de decisões de framework
- Treinamento e educação em gerenciamento de projetos

## 🤝 Contribuição

Sinta-se à vontade para contribuir com este projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob os termos descritos no arquivo LICENSE.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com o mantenedor.