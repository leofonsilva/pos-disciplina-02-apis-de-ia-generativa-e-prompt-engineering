import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { buildGraph } from './graph/factory.ts';
import { getUser } from './config.ts';
import { readFileSync } from 'fs';

// Extrai argumentos da linha de comando para configurar o teste
function parseArgs(): { username?: string; unsafe: boolean; message?: string; promptPath?: string } {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');
  const messageIndex = args.indexOf('--message');
  const unsafe = args.includes('--unsafe');  // Flag que desativa guardrails
  const promptPathIndex = args.indexOf('--prompt-path');

  let promptPath: string | undefined;
  if (promptPathIndex !== -1 && args[promptPathIndex + 1]) {
    promptPath = args[promptPathIndex + 1];  // Caminho para arquivo com o prompt
  }

  let username: string | undefined;
  if (userIndex !== -1 && args[userIndex + 1]) {
    username = args[userIndex + 1];  // Nome do usuário
  }

  let message: string | undefined;
  if (messageIndex !== -1 && args[messageIndex + 1]) {
    message = args[messageIndex + 1];  // Mensagem direta via linha de comando
  }

  return { username, unsafe, message, promptPath };
}

// Exibe banner informativo com status de segurança
function displayBanner(username: string, role: string, guardrailsEnabled: boolean) {
  console.log('═'.repeat(70));
  console.log('Guardrails & Prompt Injection Demo');
  console.log('═'.repeat(70));
  console.log();
  console.log(`User: ${username} (${role})`);
  console.log(`Guardrails: ${guardrailsEnabled ? 'ENABLED (Safe)' : 'DISABLED (Unsafe - Vulnerable!)'}`);
  console.log();

  console.log('─'.repeat(70));
  console.log();
}

// Ponto de entrada da CLI para testar sistema de guardrails
async function main(): Promise<void> {
  try {
    // Extrai argumentos da linha de comando
    const { username, unsafe, message, promptPath } = parseArgs();

    // Valida argumentos obrigatórios: usuário e uma forma de prompt (mensagem ou arquivo)
    if (!username || (!message && !promptPath)) {
      console.error('Error: --user and (--message or --prompt-path) flags are required');
      console.error('Usage: npm run chat -- --user <username> --message "your message" [--unsafe]');
      console.error('Available users: leonardo (admin), tamara (member)');
      process.exit(1);
    }

    // Obtém o prompt: direto da mensagem ou lendo de um arquivo
    const prompt = message ?? readFileSync(promptPath!, 'utf-8')

    // Busca o usuário no banco de dados (users.json)
    const user = getUser(username);
    if (!user) {
      console.error(`Error: User "${username}" not found`);
      console.error('Available users: leonardo (admin), tamara (member)');
      process.exit(1);
    }

    // Guardrails ativados por padrão, desativados apenas com flag --unsafe
    // Isso permite comparar comportamento com e sem proteção
    const guardrailsEnabled = !unsafe;

    // Constrói o grafo que contém os nós: guardrails_check, chat e blocked
    const graph = await buildGraph();

    // Exibe banner com status de segurança e informações do usuário
    displayBanner(user.displayName, user.role, guardrailsEnabled);
    console.log(`Your permissions: ${user.permissions.length > 0 ? user.permissions.join(', ') : 'None'}`);
    console.log();
    console.log(`You: ${prompt}`);
    console.log();

    // Executa o grafo com a mensagem do usuário
    // O fluxo será: guardrails_check → (chat ou blocked) → END
    const result = await graph.invoke({
      user,
      guardrailsEnabled,   // Se false, guardrails_check retorna safe=true sem verificar
      messages: [new HumanMessage(prompt)],
    });

    // Extrai a última mensagem da resposta (do nó chat ou blocked)
    const messages = result.messages as BaseMessage[];
    const lastMessage = messages[messages.length - 1];
    console.log(`Assistant: ${lastMessage.content}`);
    console.log();

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executa a CLI
main();
