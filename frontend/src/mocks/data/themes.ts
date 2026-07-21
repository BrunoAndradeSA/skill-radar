import type { Theme } from '../../models/Theme';

export const themes: Theme[] = [
  {
    id: 'theme-java',
    name: 'Java',
    description: 'Programação orientada a objetos, concorrência, streams e arquitetura da JVM.'
  },
  {
    id: 'theme-springboot',
    name: 'Spring Boot',
    description: 'Injeção de dependência, persistência com JPA/Hibernate, segurança e APIs REST.'
  },
  {
    id: 'theme-python',
    name: 'Python',
    description: 'Sintaxe moderna, estruturas de dados, decoradores, geradores e concorrência com asyncio.'
  },
  {
    id: 'theme-fastapi',
    name: 'FastAPI',
    description: 'Desenvolvimento ágil de APIs de alta performance com Python, tipagem estática e Pydantic.'
  },
  {
    id: 'theme-docker',
    name: 'Docker',
    description: 'Containers, criação de imagens eficientes, volumes, redes e orquestração local com Compose.'
  },
  {
    id: 'theme-kubernetes',
    name: 'Kubernetes',
    description: 'Orquestração de containers em produção: Pods, Deployments, Services, ConfigMaps e Ingress.'
  },
  {
    id: 'theme-git',
    name: 'Git',
    description: 'Controle de versão distribuído, fluxos de trabalho (branching), rebase e resolução de conflitos.'
  },
  {
    id: 'theme-oracleplsql',
    name: 'Oracle PL/SQL',
    description: 'Banco de dados relacional Oracle, queries SQL complexas, procedures, triggers e tuning de performance.'
  },
  {
    id: 'theme-cleancode',
    name: 'Clean Code',
    description: 'Princípios SOLID, padrões de projeto, refatoração, legibilidade e manutenabilidade de código.'
  }
];
