import { readFileSync } from 'fs';
import usersData from '../data/users.json' with { type: 'json' };

// Estrutura de dados do usuário
export type User = {
  username: string;           // Identificador único
  role: 'admin' | 'member';   // Papel do usuário (admin ou membro comum)
  permissions: string[];      // Lista de permissões específicas
  displayName: string;        // Nome para exibição
};

// Banco de dados de usuários carregado do arquivo JSON
export const users: Record<string, User> = usersData as Record<string, User>;

// Prompts carregados de arquivos .txt (para evitar hardcoding)
export const prompts = {
  blocked: readFileSync('./prompts/blocked.txt', 'utf-8'),      // Mensagem de bloqueio
  system: readFileSync('./prompts/system.txt', 'utf-8'),        // Prompt de sistema principal
  guardrails: readFileSync('./prompts/guardrails.txt', 'utf-8'), // Prompt para detecção de injeção
}

// Configuração dos modelos e provedores
export type ModelConfig = {
  apiKey: string;              // Chave da API OpenRouter
  httpReferer: string;         // Site de origem (opcional)
  xTitle: string;              // Nome do projeto

  provider: {
    sort: {
      by: string;              // Critério: 'price' ou 'throughput'
      partition: string;       // Particionamento dos resultados
    };
  };

  models: string[];            // Lista de modelos disponíveis
  temperature: number;         // Controle de criatividade (0 = preciso, 1 = criativo)
  maxTokens: number;           // Limite máximo de tokens na resposta
  guardrailsModel: string;     // Modelo específico para segurança
};

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Guardrails'!,

  // Modelo principal para chat (mais barato)
  models: [
    // 'upstage/solar-pro-3:free',
    'qwen/qwen-2.5-7b-instruct',  // Modelo mais barato, mas sem proteção contra injeção
  ],

  // Modelo especializado para detectar injeção de prompt (mais seguro)
  guardrailsModel: 'openai/gpt-oss-safeguard-20b',

  provider: {
    sort: {
      by: 'price',        // Prioriza modelo mais barato
      partition: 'none',
    },
  },
  temperature: 0.7,
  maxTokens: 1000,
};

// Busca um usuário pelo nome de usuário
export function getUser(username: string): User | undefined {
  return users[username];
}
