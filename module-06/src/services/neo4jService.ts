import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph';
import { config } from '../config.ts';

// Serviço para gerenciar conexão e operações com Neo4j
export class Neo4jService {
  private graph: Neo4jGraph | null = null;                  // Instância do cliente Neo4j
  private initializing: Promise<Neo4jGraph> | null = null;  // Evita múltiplas inicializações

  // Obtém a instância do grafo (singleton com lazy loading)
  private async getGraph(): Promise<Neo4jGraph> {
    // Retorna instância existente se já inicializada
    if (this.graph) {
      return this.graph;
    }

    // Aguarda inicialização em andamento (evita race conditions)
    if (this.initializing) {
      return this.initializing;
    }

    // Inicializa nova conexão
    this.initializing = Neo4jGraph.initialize({
      url: config.neo4j.uri,            // Endpoint do Neo4j
      username: config.neo4j.username,  // Usuário
      password: config.neo4j.password,  // Senha
      enhancedSchema: false,            // Schema simples (sem análise avançada)
    });

    this.graph = await this.initializing;
    this.initializing = null;
    return this.graph;
  }

  // Obtém o esquema do banco (labels, relacionamentos, propriedades)
  async getSchema(): Promise<string> {
    try {
      const graph = await this.getGraph();
      return await graph.getSchema();
    } catch (error) {
      console.error('Error getting schema:', error);
      return '';
    }
  }

  // Valida a sintaxe de uma query Cypher (sem executar)
  async validateQuery(query: string): Promise<boolean> {
    try {
      const graph = await this.getGraph();
      await graph.query(`EXPLAIN ${query}`);  // EXPLAIN apenas valida, não executa
      return true;
    } catch (error) {
      console.error('Query validation failed:', error);
      return false;
    }
  }

  // Executa uma query Cypher e retorna os resultados
  async query<T = any>(cypherQuery: string, parameters?: any): Promise<T[]> {
    try {
      const graph = await this.getGraph();
      const result = await graph.query(cypherQuery, parameters);
      return result as T[];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Limpa todos os dados do banco (útil para testes)
  async clearDatabase(): Promise<void> {
    try {
      const graph = await this.getGraph();
      await graph.query('MATCH (n) DETACH DELETE n');  // Remove todos os nós e relacionamentos
      console.log('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  // Fecha a conexão com o banco
  async close(): Promise<void> {
    try {
      // Aguarda inicialização pendente antes de fechar
      if (this.initializing) {
        await this.initializing;
      }

      if (this.graph) {
        await this.graph.close();
        this.graph = null;
      }
    } catch (error) {
      console.error('Error closing Neo4j connection:', error);
      this.graph = null;
    }
  }
}
