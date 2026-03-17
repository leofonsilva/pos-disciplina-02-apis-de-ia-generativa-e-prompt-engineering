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

## Resumo das Tecnologias
Pendente...