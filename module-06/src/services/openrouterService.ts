import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import type { z } from 'zod/v3';
import { createAgent, providerStrategy } from 'langchain';

export type LLMResponse = {
  model: string;
  content: string;
};

// Serviço para integração com a API do OpenRouter (acesso a múltiplos modelos de IA)
export class OpenRouterService {
  private llmClient: ChatOpenAI;

  constructor() {
    // Configura o cliente OpenAI para usar a API do OpenRouter
    this.llmClient = new ChatOpenAI({
      apiKey: config.apiKey,                     // Chave de autenticação
      modelName: config.models[0],               // Modelo principal (fallback)
      temperature: config.temperature,           // Controle de criatividade
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1', // Endpoint do OpenRouter
        defaultHeaders: {
          'HTTP-Referer': config.httpReferer,    // Identificação do site
          'X-Title': config.xTitle,              // Nome do projeto
        },
      },

      // Configuração específica do OpenRouter para roteamento inteligente
      modelKwargs: {
        models: config.models,                  // Lista de modelos disponíveis
        provider: config.provider,              // Critérios de seleção (preço/velocidade)
      },
    });
  }

  // Gera respostas estruturadas seguindo um schema Zod
  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>,
  ) {
    try {
      // Cria um agente que retorna respostas no formato estruturado
      const agent = createAgent({
        model: this.llmClient,
        tools: [],
        responseFormat: providerStrategy(schema),  // Força resposta no schema definido
      })

      const messages = [
        new SystemMessage(systemPrompt),  // Instruções de sistema
        new HumanMessage(userPrompt),     // Pergunta do usuário
      ];

      const data = await agent.invoke({ messages });

      return {
        success: true,
        data: data.structuredResponse as T,  // Resposta validada pelo schema
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
