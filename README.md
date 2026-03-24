# Pós Disciplina 02 – APIs de IA Generativa e Prompt Engineering

## Introdução
Pendente...

## Módulos

### Módulo 01: Panorama do Mercado de IA Como Serviço
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

### Módulo 02: Langchain.js - A introdução
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

### Módulo 03: Engenharia de Prompts Avançada Com Prompt Chaining e JSON Prompts
**Projeto:** [Medical Appointment Scheduler](module-03)

**Tecnologias utilizadas:**
- **Fastify** - Framework web rápido e de baixo overhead para Node.js
- **LangChain** - Framework para construção de aplicações com LLMs
- **LangGraph** - Biblioteca para criação de grafos de estados com agentes
- **OpenRouter SDK** - SDK para acesso unificado a múltiplos modelos de IA
- **Zod** - Validação de schemas TypeScript
- **TypeScript** - Linguagem tipada para desenvolvimento robusto

**Conceitos abordados:**
- Grafos de estados com injeção de dependências
- Identificação de intenção e extração de entidades com IA
- Integração com serviços externos (APIs, bancos de dados)
- Validação robusta de dados com Zod
- Padrão Factory para criação de nós
- Roteamento condicional baseado em intenção
- Geração de respostas naturais estruturadas
- Separação de responsabilidades (serviços, nós, grafo)

**Aplicação prática:**
O projeto implementa um sistema completo de agendamento de consultas médicas via linguagem natural. O usuário envia mensagens como "Quero marcar uma consulta com a Dra. Ana na terça-feira", e o sistema: (1) identifica a intenção (agendar/cancelar) e extrai entidades (profissional, data, paciente) usando IA; (2) valida os dados extraídos; (3) executa a ação no serviço de agendamento; (4) gera uma resposta natural confirmando ou explicando o resultado. Demonstra a construção de aplicações de IA com integração real, validação robusta e gerenciamento de estado em workflows complexos.

### Módulo 04: Extração de preferências em perguntas de usuário, memória e compactação de contexto
**Projeto:** [Song Recommender with Memory](module-04)

**Tecnologias utilizadas:**
- **LangChain** - Framework para construção de aplicações com LLMs
- **LangGraph** - Biblioteca para criação de grafos de estados com agentes
- **OpenRouter SDK** - SDK para acesso unificado a múltiplos modelos de IA
- **PostgreSQL** - Banco de dados relacional para persistência de memória
- **LibSQL** - Banco de dados SQLite com suporte a vetores para preferências
- **Zod** - Validação de schemas TypeScript
- **TypeScript** - Linguagem tipada para desenvolvimento robusto

**Conceitos abordados:**
- Persistência de estado com MemorySaver e checkpoints
- Armazenamento de longo prazo com vector stores
- Sessões isoladas por thread ID
- Conversational stateful AI
- Sumarização automática de histórico
- Extração e armazenamento de preferências de usuário
- Padrão de serviços para memória e preferências
- Integração com bancos de dados SQL (PostgreSQL e SQLite)

**Aplicação prática:**
O projeto implementa um sistema de recomendação de músicas que mantém memória conversacional entre interações. O sistema utiliza PostgreSQL para persistir checkpoints de estado (MemorySaver) e LibSQL como vector store para armazenar preferências de usuário de forma semanticamente searchable. A IA conduz uma conversa natural, extrai preferências musicais, salva-as no banco de dados, e usa essas informações para fazer recomendações personalizadas. Ao longo das conversas, uma sumarização é feita para reduzir o contexto. Demonstra padrões de produção para memória persistente, sessões isoladas, e arquitetura escalável com múltiplas camadas de armazenamento.

### Módulo 05: Prompt Injection, Prompt Hijacking e Guardrails - Segurança Para Suas Aplicações de IA Integrada
**Projeto:** [Guardrails & Prompt Injection](module-05)

**Tecnologias utilizadas:**
- **LangChain** - Framework para construção de aplicações com LLMs
- **LangGraph** - Biblioteca para criação de grafos de estados com agentes
- **OpenRouter SDK** - SDK para acesso unificado a múltiplos modelos de IA
- **MCP (Model Context Protocol)** - Protocolo para ferramentas externas
- **Zod** - Validação de schemas TypeScript
- **TypeScript** - Linguagem tipada para desenvolvimento robusto

**Conceitos abordados:**
- Prompt injection attacks e bypass de segurança
- Guardrails baseados em LLM para detecção de injeção
- Role-based access control (RBAC)
- Arquitetura de segurança fail-closed
- Fluxo condicional com LangGraph
- Template strings seguras vs substituição direta
- Testes de segurança e demonstrações práticas
- MCP para ferramentas externas (sistema de arquivos)

**Aplicação prática:**
O projeto implementa uma demonstração educacional de segurança contra prompt injection. Utiliza um sistema de guardrails baseado em LLM que analisa mensagens do usuário antes de chegar ao modelo principal. O sistema distingue entre usuários admin (com permissões) e membros (sem permissões), bloqueando tentativas de bypass de segurança como "ignore previous instructions" ou "act as admin". Demonstra que prompt instructions sozinhas são insuficientes e que arquiteturas de segurança fail-closed são essenciais para aplicações de IA em produção.

### Módulo 06: RAG Avançado na Prática

**Projeto:** [RAG Neo4j Students](module-06)

**Tecnologias utilizadas:**

* **LangChain** - Orquestração de LLMs e structured output
* **LangGraph** - Execução de fluxos multi-step com controle de estado
* **Neo4j** - Banco de dados orientado a grafos para consultas relacionais
* **OpenRouter SDK** - Acesso a múltiplos modelos de linguagem
* **Zod** - Validação de schemas e tipagem do estado
* **Fastify** - Servidor HTTP performático
* **TypeScript** - Tipagem estática e organização do código

**Conceitos abordados:**
- Arquitetura RAG (Retrieval-Augmented Generation) com banco de grafos
- Geração automática de queries Cypher via LLM
- Execução e validação de queries no Neo4j
- Self-healing pipeline com correção automática de queries
- Decomposição de perguntas complexas (multi-step reasoning)
- Orquestração de fluxo com LangGraph (State Machine)
- Structured output com validação via Zod
- Tratamento de erros e fallback em pipelines de IA
- Problemas de determinismo em LLMs e impacto em testes E2E

**Aplicação prática:**
O projeto implementa um sistema de analytics sobre dados de vendas utilizando Neo4j como fonte de verdade. Perguntas em linguagem natural são convertidas em queries Cypher por um LLM, executadas no banco e transformadas em respostas analíticas. O fluxo utiliza LangGraph para orquestrar etapas como extração da pergunta, planejamento, geração de query, execução, correção automática em caso de erro e síntese final da resposta. Suporta queries simples e multi-step, permitindo análises mais complexas como co-enrollment de cursos e distribuição de receita. Também evidencia desafios reais de aplicações com LLM, como instabilidade, necessidade de validação e tratamento de respostas não determinísticas.

### Módulo 07: Pipeline de QA com Documentos e LLM Multimodal
**Projeto:** [Document Q&A Pipeline](module-07)

**Tecnologias utilizadas:**
- **Fastify** - Framework web rápido e de baixo overhead para Node.js
- **LangChain** - Framework para construção de aplicações com LLMs
- **LangGraph** - Biblioteca para criação de grafos de estados com agentes
- **OpenRouter SDK** - SDK para acesso unificado a múltiplos modelos de IA
- **Zod** - Validação de schemas TypeScript
- **TypeScript** - Linguagem tipada para desenvolvimento robusto
- **Form-data** - Manipulação de uploads de arquivos
- **Multipart** - Suporte a uploads de documentos

**Conceitos abordados:**
- Pipeline de QA com documentos (PDF, imagens)
- Modelo multimodal para análise de documentos
- Roteamento inteligente entre modelos de IA
- Validação de schemas com Zod
- Arquitetura de fluxo linear com LangGraph
- Tratamento de erros e fallback
- Integração com OpenRouter para modelos multimodais
- Upload de documentos via API
- Geração de respostas baseadas no conteúdo do documento
- Testes automáticos com documentos de exemplo

**Aplicação prática:**
O projeto implementa um servidor HTTP com uma rota `/chat` que aceita uploads de documentos (PDF, imagens) e perguntas sobre seu conteúdo. O sistema utiliza um modelo multimodal para analisar o documento e gerar respostas contextuais. Demonstra a criação de um pipeline de QA com documentos, incluindo: (1) upload de arquivo; (2) análise multimodal; (3) geração de resposta; (4) tratamento de erros. O fluxo é linear e simples, mas demonstra conceitos importantes de integração com LLMs multimodais e processamento de documentos.

## Resumo das Tecnologias
Pendente...
