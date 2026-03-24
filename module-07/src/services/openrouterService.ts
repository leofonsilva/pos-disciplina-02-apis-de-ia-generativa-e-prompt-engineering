import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export type LLMResponse = {
  model: string;
  content: string;
};

// Serviço para integração com a API do OpenRouter (suporte multimodal)
export class OpenRouterService {
  private llmClient: ChatOpenAI;

  constructor() {
    // Configura o cliente OpenAI para usar a API do OpenRouter
    this.llmClient = new ChatOpenAI({
      apiKey: config.apiKey,                    // Chave de autenticação
      modelName: config.models[0],              // Modelo principal (fallback)
      temperature: config.temperature,          // Controle de criatividade
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1', // Endpoint do OpenRouter
        defaultHeaders: {
          'HTTP-Referer': config.httpReferer,   // Identificação do site
          'X-Title': config.xTitle,             // Nome do projeto
        },
      },

      // Configuração específica do OpenRouter para roteamento inteligente
      modelKwargs: {
        models: config.models,                  // Lista de modelos disponíveis
        provider: config.provider,              // Critérios de seleção (preço/velocidade)
      },
    });
  }

  // Gera resposta baseada em documento (imagem/PDF) usando modelo multimodal
  async generateWithDocument(
    systemPrompt: string,
    userPrompt: string,
    documentBase64: string,
  ): Promise<LLMResponse> {
    try {
      // Prepara mensagem com conteúdo multimodal (texto + imagem/documento)
      const messages = [
        new SystemMessage(systemPrompt),  // Instruções de sistema
        new HumanMessage({
          content: [
            {
              type: "text",
              text: userPrompt,           // Pergunta do usuário
            },
            {
              type: "image_url",
              image_url: {
                // Documento codificado em base64 (imagem ou PDF)
                url: `data:application/pdf;base64,${documentBase64}`,
              },
            },
          ],
        }),
      ];

      // Invoca o modelo multimodal
      const response = await this.llmClient.invoke(messages);

      // Retorna o modelo utilizado e o conteúdo gerado
      return {
        model: response.response_metadata?.model_name || config.models[0],
        content: response.content.toString(),
      };
    } catch (error) {
      throw new Error(`Multimodal generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
