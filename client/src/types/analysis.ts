export interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

export interface FrameworkInfo {
  id: string;
  name: string;
  description: string;
  application: string;
  category: string;
}

export const FRAMEWORKS: FrameworkInfo[] = [
  {
    id: "business-model-canvas",
    name: "Business Model Canvas",
    description: "Ferramenta visual para desenvolver novos modelos de negócio ou documentar os existentes, cobrindo 9 blocos essenciais.",
    application: "Analisará se o documento contempla proposta de valor, segmentos de clientes, canais, relacionamentos, receitas, recursos, atividades, parcerias e custos.",
    category: "Estratégia e Negócios"
  },
  {
    id: "lean-canvas",
    name: "Lean Canvas",
    description: "Versão adaptada do Business Model Canvas focada em startups e produtos lean, priorizando problemas e soluções.",
    application: "Verificará se o documento identifica problemas claros, soluções propostas, métricas-chave e vantagens competitivas.",
    category: "Estratégia e Negócios"
  },
  {
    id: "product-strategy-guide",
    name: "Product Strategy Guide (DHM)",
    description: "Framework DHM (Delight, Hard to Copy, Margin) para avaliar estratégias de produto em três dimensões críticas.",
    application: "Analisará se o produto/feature encanta usuários, é difícil de copiar e gera margem sustentável.",
    category: "Estratégia e Negócios"
  },
  {
    id: "tam-sam-som",
    name: "Tamanho de Mercado (TAM/SAM/SOM)",
    description: "Framework para dimensionar oportunidades de mercado em três níveis: Total, Servível e Obtível.",
    application: "Verificará se o documento apresenta análise adequada do tamanho e potencial do mercado-alvo.",
    category: "Estratégia e Negócios"
  },
  {
    id: "swot-analysis",
    name: "Análise SWOT",
    description: "Análise de forças, fraquezas, oportunidades e ameaças para avaliar posicionamento estratégico.",
    application: "Identificará se o documento considera fatores internos e externos que impactam o sucesso do produto.",
    category: "Estratégia e Negócios"
  },
  {
    id: "competitive-analysis",
    name: "Análise Competitiva",
    description: "Framework para mapear e analisar concorrentes diretos e indiretos no mercado.",
    application: "Verificará se há análise adequada da concorrência e diferenciação competitiva.",
    category: "Estratégia e Negócios"
  },
  {
    id: "matriz-csd",
    name: "Matriz CSD",
    description: "Framework para organizar Certezas, Suposições e Dúvidas em processos de discovery.",
    application: "Analisará se o documento diferencia entre o que é conhecido, assumido e precisa ser investigado.",
    category: "Discovery e Experimentação"
  },
  {
    id: "continuous-discovery",
    name: "Continuous Discovery (Teresa Torres)",
    description: "Abordagem para descoberta contínua do produto através de pesquisa regular com usuários.",
    application: "Verificará se há processo estruturado para aprendizado contínuo com usuários e validação de hipóteses.",
    category: "Discovery e Experimentação"
  },
  {
    id: "opportunity-solution-tree",
    name: "Opportunity Solution Tree (Teresa Torres)",
    description: "Framework para mapear oportunidades, identificar soluções e estruturar descobertas do produto de forma visual e hierárquica.",
    application: "Será usado para analisar se o documento identifica claramente a oportunidade, explora soluções alternativas e define hipóteses testáveis.",
    category: "Discovery e Experimentação"
  },
  {
    id: "opportunity-assessment",
    name: "Opportunity Assessment (Inspired, Marty Cagan)",
    description: "Framework de Marty Cagan para avaliar oportunidades de produto antes do desenvolvimento.",
    application: "Analisará se o documento responde às 4 perguntas críticas: valor para usuário, viabilidade, factibilidade e valor para negócio.",
    category: "Avaliação e Oportunidade"
  },
  {
    id: "user-story-mapping",
    name: "User Story Mapping",
    description: "Técnica para organizar user stories em uma jornada do usuário, priorizando entregas e releases.",
    application: "Verificará se as funcionalidades estão organizadas na perspectiva da jornada do usuário e priorizadas adequadamente.",
    category: "Processos e Priorização"
  },
  {
    id: "press-release-faq",
    name: "Press Release + FAQ (Amazon style)",
    description: "Método da Amazon para começar produtos pelo comunicado de imprensa, forçando clareza sobre valor e benefícios.",
    application: "Analisará se o documento comunica claramente o valor para o cliente e antecipa questões importantes.",
    category: "Processos e Priorização"
  },
  {
    id: "user-stories",
    name: "Escrevendo boas User Stories",
    description: "Framework para criar user stories efetivas seguindo boas práticas de estrutura e critérios de aceitação.",
    application: "Verificará se as histórias seguem o formato adequado, têm critérios claros e representam valor real para usuários.",
    category: "Processos e Priorização"
  },
  {
    id: "pm-wheel",
    name: "PMWheel (autoavaliação para PMs)",
    description: "Framework de autoavaliação para Product Managers em diferentes competências e habilidades.",
    application: "Analisará se o documento demonstra aplicação adequada de competências essenciais de product management.",
    category: "Processos e Priorização"
  },
  {
    id: "rice-score",
    name: "RICE Score",
    description: "Framework de priorização baseado em Reach, Impact, Confidence e Effort para ranquear iniciativas.",
    application: "Verificará se há análise adequada de alcance, impacto, confiança e esforço para priorização.",
    category: "Processos e Priorização"
  },
  {
    id: "rapid-framework",
    name: "RAPID Framework",
    description: "Framework para clarificar papéis em tomada de decisão: Recommend, Agree, Perform, Input, Decide.",
    application: "Analisará se estão claros os papéis e responsabilidades na execução da iniciativa.",
    category: "Processos e Priorização"
  },
  {
    id: "north-star-metric",
    name: "North Star Metric",
    description: "Framework para definir a métrica principal que representa o valor entregue aos usuários.",
    application: "Verificará se há métrica clara que representa o sucesso do produto para usuários e negócio.",
    category: "Métricas"
  },
  {
    id: "metrics-tree",
    name: "Árvore de Métricas",
    description: "Estrutura hierárquica para organizar métricas desde indicadores de resultado até métricas operacionais.",
    application: "Analisará se há sistema coerente de métricas conectando ações a resultados de negócio.",
    category: "Métricas"
  },
  {
    id: "product-kpis",
    name: "KPIs de Produto",
    description: "Framework para definir indicadores-chave de performance específicos para produtos digitais.",
    application: "Verificará se há KPIs apropriados para medir sucesso de adoção, engajamento e valor do produto.",
    category: "Métricas"
  },
  {
    id: "ppm-canvas",
    name: "PPM Canvas (Vision, Goals, Bets, Indicators)",
    description: "Canvas estruturado para alinhar visão, objetivos, apostas e indicadores em produto.",
    application: "Analisará se há alinhamento claro entre visão de produto, metas, hipóteses e métricas de sucesso.",
    category: "Extras"
  },
  {
    id: "now-next-later",
    name: "Estratégia Now/Next/Later",
    description: "Framework temporal para organizar roadmap em três horizontes: agora, próximo e futuro.",
    application: "Verificará se há visão temporal clara das prioridades e evolução do produto.",
    category: "Extras"
  }
];
