import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from './graph/factory.ts';

// Extrai argumentos da linha de comando (ex: --user joao)
function parseArgs(): { userId?: string } {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');

  if (userIndex !== -1 && args[userIndex + 1]) {
    return { userId: args[userIndex + 1] };
  }

  return {};
}

// Ponto de entrada da aplicação CLI
async function main(): Promise<void> {
  const readline = createInterface({ input: stdin, output: stdout });

  try {
    console.log('═'.repeat(60));
    console.log('Recomendador de Músicas com Memória (LangGraph)');
    console.log('═'.repeat(60));
    console.log('\nDigite suas mensagens abaixo. Digite "exit" para sair.\n');

    // Constrói o grafo e o serviço de preferências
    const { graph, preferencesService } = await buildGraph();

    // Obtém o ID do usuário (via argumento ou padrão)
    const { userId } = parseArgs();
    const actualUserId = userId || 'anonymous';
    
    // Cria um thread único para esta sessão de conversa
    const threadId = `${actualUserId}-${Date.now()}`;
    const config = {
      configurable: { thread_id: threadId },  // Identificador para o checkpointer
      context: { userId: actualUserId }       // Contexto adicional para os nós
    };

    console.log(`Usuário: ${actualUserId}`);
    console.log(`Thread da Conversa: ${threadId}\n`);

    // Carrega preferências salvas anteriormente (se existirem)
    const userContext = await preferencesService.getBasicInfo(actualUserId);
    if (userContext) {
      console.log(`Informações do usuário carregadas:\n${userContext}\n`);
    }

    // Mensagem inicial para a IA (personalizada se já conhece o usuário)
    try {
      const initialMessage = userContext
        ? 'Inicie a conversa de forma casual mencionando o que você sabe sobre mim e recomende uma música!'
        : 'Olá! Me apresente de forma amigável e pergunte sobre meu nome e preferências musicais.';

      // Invoca o grafo com a mensagem inicial
      const result = await graph.invoke(
        {
          messages: [new HumanMessage(initialMessage)],
          userContext,
          userId: actualUserId,
        },
        config
      );

      // Mostra a primeira resposta da IA
      const greeting = result.messages[result.messages.length - 1];
      console.log(`AI: ${greeting.content}\n`);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', (error as Error).message);
    }

    // Loop principal da conversa
    while (true) {
      const userInput = await readline.question('Você: ');

      if (!userInput.trim()) continue;
      if (userInput.toLowerCase() === 'exit') {
        console.log('\nAté mais!\n');
        break;
      }

      try {
        // Envia a mensagem do usuário para o grafo
        const result = await graph.invoke(
          {
            messages: [new HumanMessage(userInput)],
            userId: actualUserId,
          },
          config
        );

        // Exibe a resposta da IA
        const lastMessage = result.messages[result.messages.length - 1];
        console.log(`\nAI: ${lastMessage.content}\n`);

      } catch (error) {
        console.error('\nErro ao gerar resposta:', error instanceof Error ? error.message : 'Erro desconhecido');
        console.log('AI: Desculpe, encontrei um erro. Pode tentar novamente?\n');
      }
    }

    readline.close();

  } catch (error) {
    console.error('\nErro fatal:', (error as Error).message);
    console.error('\nStack trace:', (error as Error).stack);
    process.exit(1);
  }
}

main();
