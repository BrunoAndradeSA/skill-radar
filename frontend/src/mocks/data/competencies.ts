import type { Competency } from '../../models/Competency';

export const competencies: Competency[] = [
  // Java
  {
    id: 'comp-java-oop',
    themeId: 'theme-java',
    name: 'Programação Orientada a Objetos',
    description: 'Domínio de encapsulamento, herança, polimorfismo, abstração e interfaces em Java.'
  },
  {
    id: 'comp-java-concurrency',
    themeId: 'theme-java',
    name: 'Concorrência e Threads',
    description: 'Uso de Threads, ExecutorService, semáforos, travas (locks) e coleções concorrentes.'
  },
  {
    id: 'comp-java-streams',
    themeId: 'theme-java',
    name: 'Streams API e Lambdas',
    description: 'Manipulação de fluxos de dados de forma funcional, Lazy Evaluation e expressões Lambda.'
  },
  {
    id: 'comp-java-jvm',
    themeId: 'theme-java',
    name: 'JVM e Gerenciamento de Memória',
    description: 'Funcionamento do Garbage Collector, Stack vs Heap, Metaspace e profiling de memória.'
  },

  // Spring Boot
  {
    id: 'comp-springboot-di',
    themeId: 'theme-springboot',
    name: 'Injeção de Dependências e IoC',
    description: 'Configuração do Spring Container, escopos de beans (@Component, @Service, @Configuration).'
  },
  {
    id: 'comp-springboot-jpa',
    themeId: 'theme-springboot',
    name: 'Persistência com JPA/Hibernate',
    description: 'Mapeamento objeto-relacional, gerenciamento de transações (@Transactional), carregamento Eager/Lazy e N+1 queries.'
  },
  {
    id: 'comp-springboot-rest',
    themeId: 'theme-springboot',
    name: 'APIs REST e Segurança',
    description: 'Criação de endpoints RESTful, tratamento global de erros (@ControllerAdvice) e Spring Security.'
  },

  // Python
  {
    id: 'comp-python-syntax',
    themeId: 'theme-python',
    name: 'Estruturas de Dados e Sintaxe',
    description: 'Manipulação de listas, dicionários, sets, list comprehensions e fatiamento (slicing).'
  },
  {
    id: 'comp-python-functional',
    themeId: 'theme-python',
    name: 'Recursos Avançados da Linguagem',
    description: 'Criação de decoradores, geradores (yield), iteradores customizados e context managers.'
  },
  {
    id: 'comp-python-async',
    themeId: 'theme-python',
    name: 'Programação Assíncrona',
    description: 'Entendimento do Event Loop, corrotinas, uso de async/await e biblioteca asyncio.'
  },

  // FastAPI
  {
    id: 'comp-fastapi-core',
    themeId: 'theme-fastapi',
    name: 'Roteamento e Validação com Pydantic',
    description: 'Definição de schemas de entrada/saída, validação automática de tipos, serialização e documentação automática.'
  },
  {
    id: 'comp-fastapi-advanced',
    themeId: 'theme-fastapi',
    name: 'Injeção de Dependências e Ciclo de Vida',
    description: 'Uso de Depend/Depends do FastAPI, gerenciamento de conexões com banco de dados e middlewares.'
  },

  // Docker
  {
    id: 'comp-docker-images',
    themeId: 'theme-docker',
    name: 'Dockerfile e Otimização',
    description: 'Criação de arquivos Dockerfile, cache de camadas, builds multi-stage e imagens minimalistas (Alpine/Distroless).'
  },
  {
    id: 'comp-docker-compose',
    themeId: 'theme-docker',
    name: 'Docker Compose e Redes',
    description: 'Orquestração de múltiplos containers locais, variáveis de ambiente, volumes persistentes e port-forwarding.'
  },

  // Kubernetes
  {
    id: 'comp-k8s-basics',
    themeId: 'theme-kubernetes',
    name: 'Conceitos Core e Workloads',
    description: 'Gerenciamento de Pods, Deployments, ReplicaSets, StatefulSets e ciclo de vida dos containers.'
  },
  {
    id: 'comp-k8s-network',
    themeId: 'theme-kubernetes',
    name: 'Redes, Serviços e Ingress',
    description: 'Exposição de workloads internamente e externamente via ClusterIP, NodePort, LoadBalancer e recursos de Ingress.'
  },

  // Git
  {
    id: 'comp-git-basics',
    themeId: 'theme-git',
    name: 'Controle de Versão e Workflows',
    description: 'Comandos cotidianos (add, commit, push, pull), branching strategies (GitFlow, Trunk-Based).'
  },
  {
    id: 'comp-git-advanced',
    themeId: 'theme-git',
    name: 'Histórico, Rebase e Conflitos',
    description: 'Resolução de conflitos de merge, uso de rebase interativo, cherry-pick, stash e reflog para recuperação.'
  },

  // Oracle PL/SQL
  {
    id: 'comp-plsql-queries',
    themeId: 'theme-oracleplsql',
    name: 'Consultas SQL Complexas',
    description: 'Joins avançados, subqueries correlacionadas, window functions (analytic queries) e operadores de conjuntos.'
  },
  {
    id: 'comp-plsql-programming',
    themeId: 'theme-oracleplsql',
    name: 'Procedimentos e Gatilhos (Triggers)',
    description: 'Criação de Stored Procedures, Functions, Triggers BEFORE/AFTER de linha/instrução e Packages.'
  },
  {
    id: 'comp-plsql-tuning',
    themeId: 'theme-oracleplsql',
    name: 'Otimização e Cursors',
    description: 'Gerenciamento de Cursors (implícitos e explícitos), tratamento de exceções customizadas e uso de indexes.'
  },

  // Clean Code
  {
    id: 'comp-clean-solid',
    themeId: 'theme-cleancode',
    name: 'Princípios SOLID',
    description: 'Aplicação dos princípios SRP, OCP, LSP, ISP e DIP para redução de acoplamento e aumento da coesão.'
  },
  {
    id: 'comp-clean-smells',
    themeId: 'theme-cleancode',
    name: 'Refatoração e Boas Práticas',
    description: 'Identificação de code smells (métodos longos, obsessão primitiva, acoplamento de recursos) e técnicas de refatoração.'
  }
];
