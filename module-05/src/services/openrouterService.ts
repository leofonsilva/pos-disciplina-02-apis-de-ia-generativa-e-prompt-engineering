import { ChatOpenAI } from '@langchain/openai';
import { config, prompts, type ModelConfig } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createAgent } from 'langchain';
import { getMCPTools } from './mcpService.ts';
import { PromptTemplate } from '@langchain/core/prompts';

// Resultado da verificação de segurança (guardrails)
export type GuardrailResult = {
  safe: boolean;      // true = mensagem segura, false = potencialmente maliciosa
  reason?: string;    // Motivo do bloqueio
  score?: number;     // Pontuação de confiança
  analysis?: string;  // Análise detalhada
};

export class OpenRouterService {
  private config: ModelConfig;
  private llmClient: ChatOpenAI;           // Cliente principal para chat
  private safeGuardModel: ChatOpenAI;      // Modelo específico para verificação de segurança
  private fsAgent: ReturnType<typeof createAgent> | null = null;  // Agente com ferramentas de sistema de arquivos

  constructor(configOverride?: ModelConfig) {
    this.config = configOverride ?? config;
    this.llmClient = this.#createChatModel(this.config.models[0]);            // Modelo principal
    this.safeGuardModel = this.#createChatModel(this.config.guardrailsModel); // Modelo de segurança
  }

  // Cria um cliente ChatOpenAI configurado para OpenRouter
  #createChatModel(modelName: string): ChatOpenAI {
    return new ChatOpenAI({
      apiKey: this.config.apiKey,
      modelName: modelName,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',   // Endpoint do OpenRouter
        defaultHeaders: {
          'HTTP-Referer': this.config.httpReferer, // Identificação do site
          'X-Title': this.config.xTitle,           // Nome do projeto
        },
      },
      modelKwargs: {
        models: this.config.models,      // Lista de modelos para roteamento
        provider: this.config.provider,  // Critérios de seleção
      },
    });
  }

  // Gera resposta usando o agente com ferramentas MCP (acesso a arquivos)
  async generate(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    // Inicializa o agente com ferramentas de sistema de arquivos (lazy loading)
    if (!this.fsAgent) {
      const tools = await getMCPTools()        // Obtém ferramentas MCP
      this.fsAgent = createAgent({
        model: this.llmClient,
        tools,                                 // Agente pode ler/escrever arquivos
      });
    }

    // Prepara as mensagens no formato esperado pelo LangChain
    const messages = [
      new SystemMessage(systemPrompt),  // Instruções de sistema (papel, regras, etc.)
      new HumanMessage(userPrompt),     // Mensagem do usuário (pergunta/instrução)
    ];

    // Invoca o agente, que vai processar a mensagem e pode usar ferramentas
    const response = await this.fsAgent.invoke({ messages });

    // Extrai o conteúdo da última mensagem (que é a resposta do agente)
    const content = String(response.messages.at(-1)?.text ?? '');

    return content;
  }

  // Verifica se a mensagem do usuário é segura (protege contra injeção de prompt)
  async checkGuardRails(
    userInput: string,
    enabled: boolean = true) {
    // Se segurança desabilitada, retorna sempre seguro (útil para testes)
    if (!enabled) {
      return { safe: true, reason: 'Guardrails disabled' }
    }

    // Formata o prompt de segurança com a mensagem do usuário
    const template = PromptTemplate.fromTemplate(prompts.guardrails)
    const input = await template.format({
      USER_INPUT: userInput,
    })

    // Envia para o modelo de segurança
    const response = await this.safeGuardModel.invoke([
      {
        role: 'user',
        content: input,
      }
    ])

    const result = response.text.trim()
    const isUnsafe = result.toUpperCase().startsWith('UNSAFE')

    if (isUnsafe) {
      return {
        safe: false,
        reason: 'Prompt Injection detected by safeguard model',
        analysis: result,  // Contém o motivo detalhado do bloqueio
      }
    }

    return {
      safe: true,
      analysis: result,    // Análise do modelo (pode conter insights)
    }
  }
}
