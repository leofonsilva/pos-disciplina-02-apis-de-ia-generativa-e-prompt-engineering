import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Obtém ferramentas MCP (Model Context Protocol) para interagir com o sistema de arquivos
export const getMCPTools = async () => {
  // Cria um cliente MCP que gerencia múltiplos servidores
  const mcpClient = new MultiServerMCPClient({
    filesystem: {
      transport: 'stdio',            // Comunicação via entrada/saída padrão
      command: 'npx',                // Executa via npx (Node Package Executor)
      args: [
        '-y',                        // Aceita instalação automaticamente
        '@modelcontextprotocol/server-filesystem',  // Servidor MCP para sistema de arquivos
        process.cwd()                // Diretório de trabalho atual (onde o servidor terá acesso)
      ]
    },
  })

  // Retorna as ferramentas disponíveis (ex: ler arquivo, escrever arquivo, listar diretório)
  return mcpClient.getTools()
}