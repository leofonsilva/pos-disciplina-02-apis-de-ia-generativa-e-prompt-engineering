# Pós Disciplina 02 – APIs de IA Generativa e Prompt Engineering

## Introdução
Pendente...

## Módulos

### Módulo 01: APIs de IA Generativa e Prompt Engineering
**Projeto:** [Smart Model Router Gateway](module-01)

**Tecnologias utilizadas:**
- **Fastify** - Framework web rápido e de baixo overhead para Node.js
- **@openrouter/sdk** - SDK para acesso unificado a múltiplos modelos de IA
- **TypeScript** - Linguagem tipada para desenvolvimento robusto

**Conceitos abordados:**
- Gateway de APIs para LLMs (Large Language Models)
- Roteamento inteligente entre múltiplos modelos de IA
- Integração com OpenRouter para acesso unificado
- Configuração de parâmetros de modelo (temperature, maxTokens)
- Engenharia de prompts com system prompts
- Validação de schemas com Fastify

**Aplicação prática:**
O projeto implementa um servidor HTTP que atua como gateway para múltiplos modelos de IA (GPT, Claude, Gemini, etc.) através da API OpenRouter. O sistema permite roteamento inteligente baseado em critérios como preço, throughput e latência, com uma rota `/chat` que recebe perguntas e retorna respostas geradas pelos modelos configurados. Demonstra a criação de uma camada de abstração para integração com LLMs e técnicas de engenharia de prompts.

### Módulo 02: Orquestração de Agentes com LangGraph
**Projeto:** [LangChain Intro](module-02)

**Tecnologias utilizadas:**
- **Fastify** - Framework web rápido e de baixo overhead para Node.js
- **LangChain** - Framework para construção de aplicações com LLMs
- **LangGraph** - Biblioteca para criação de grafos de estados com agentes
- **Zod** - Validação de schemas TypeScript
- **TypeScript** - Linguagem tipada para desenvolvimento robusto

**Conceitos abordados:**
- Grafos de estados para orquestração de agentes
- Processamento condicional baseado em intenção
- Arquitetura de nós (nodes) especializados
- Gerenciamento de estado compartilhado entre nós
- Integração de múltiplos processadores em pipeline
- Padrão de fluxo de trabalho (workflow) com LangGraph

**Aplicação prática:**
O projeto implementa um servidor HTTP com uma rota `/chat` que processa perguntas através de um grafo de estados LangGraph. O sistema identifica a intenção do usuário (uppercase, lowercase, ou pergunta normal) e roteia para nós especializados que processam a entrada. Cada nó transforma o estado e passa para o próximo, culminando em uma resposta final gerada por um nó de chat response. Demonstra a criação de workflows complexos com múltiplos caminhos de execução e o gerenciamento de estado em aplicações de IA.

## Resumo das Tecnologias
Pendente...