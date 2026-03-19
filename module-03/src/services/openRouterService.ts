import { ChatOpenAI } from "@langchain/openai";
import { config, type ModelConfig } from "../config.ts";
import { z } from 'zod/v3'
import { createAgent, HumanMessage, providerStrategy, SystemMessage } from "langchain";

export class OpenRouterService {
  private config: ModelConfig
  private llmClient: ChatOpenAI

  constructor(configOverride?: ModelConfig) {
    this.config = configOverride ?? config

    // Configura o cliente OpenAI para usar a API do OpenRouter
    this.llmClient = new ChatOpenAI({
      apiKey: this.config.apiKey,
      modelName: this.config.models.at(0),  // Modelo principal (fallback)
      temperature: this.config.temperature,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',  // URL da API do OpenRouter
        defaultHeaders: {
          'HTTP-Referer': this.config.httpReferer,  // Identificação do site
          'X-Title': this.config.xTitle              // Nome do projeto
        }
      },

      // Configuração específica do OpenRouter para roteamento inteligente
      modelKwargs: {
        models: this.config.models,      // Lista de modelos disponíveis
        provider: this.config.provider    // Critérios de seleção (preço, velocidade)
      }
    })
  }

  // Gera respostas estruturadas seguindo um schema Zod
  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>
  ) {
    try {
      // Cria um agente que retorna respostas no formato estruturado
      const agent = createAgent({
        model: this.llmClient,
        tools: [],
        responseFormat: providerStrategy(schema)  // Força resposta no schema definido
      })
      
      const messages = [
        new SystemMessage(systemPrompt),  // Instruções de sistema
        new HumanMessage(userPrompt)      // Pergunta do usuário
      ]
      
      const data = await agent.invoke({ messages })
      
      return {
        success: true,
        data: data.structuredResponse,    // Resposta já validada pelo schema
      }
      
    } catch (error) {
      console.error('Error OpenRouterService', error)

      return {
        success: true,
        error: error instanceof Error ?
          error.message :
          String(error),
      }
    }
  }
}
