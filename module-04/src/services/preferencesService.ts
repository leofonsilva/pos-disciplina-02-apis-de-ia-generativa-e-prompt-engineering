import pkg from 'knex';
const { knex } = pkg;
import type { Knex } from 'knex';
import type { ConversationSummary } from '../prompts/v1/summarization.ts';
import type { UserPreferences } from '../prompts/v1/chatResponse.ts';

// Serviço para gerenciar preferências de usuários em banco SQLite
export class PreferencesService {
  private db: Knex;
  private isSetup = false;

  constructor(dbPath: string) {
    // Conecta ao banco SQLite usando o caminho fornecido
    this.db = knex({
      client: 'better-sqlite3',
      connection: {
        filename: dbPath.replace('file:', ''),
      },
      useNullAsDefault: true,
    });
  }

  // Cria a tabela de preferências se não existir
  async setup(): Promise<void> {
    if (this.isSetup) return;

    const hasTable = await this.db.schema.hasTable('user_preferences');

    if (!hasTable) {
      await this.db.schema.createTable('user_preferences', (table) => {
        table.increments('id').primary();
        table.string('user_id').unique().notNullable();  // Identificador único do usuário
        table.string('name');                            // Nome do usuário
        table.integer('age');                            // Idade
        table.json('favorite_genres');                   // Gêneros favoritos (array JSON)
        table.json('favorite_bands');                    // Bandas favoritas (array JSON)
        table.text('key_preferences');                   // Resumo das preferências
        table.text('important_context');                 // Contexto importante extra
        table.timestamp('updated_at').defaultTo(this.db.fn.now()); // Última atualização
      });
    }

    this.isSetup = true;
  }

  // Mescla novas preferências com as existentes (evita duplicação)
  async mergePreferences(userId: string, prefs: UserPreferences): Promise<void> {
    await this.setup();

    const existing = await this.getSummary(userId);

    // Combina gêneros novos com os existentes (sem duplicar)
    const mergedGenres = prefs.favoriteGenres?.length
      ? [...new Set([...(existing?.favoriteGenres || []), ...prefs.favoriteGenres])]
      : existing?.favoriteGenres;

    // Combina bandas novas com as existentes (sem duplicar)
    const mergedBands = prefs.favoriteBands?.length
      ? [...new Set([...(existing?.favoriteBands || []), ...prefs.favoriteBands])]
      : existing?.favoriteBands;

    // Constrói contexto a partir de informações adicionais
    const contextParts = [
      existing?.importantContext,
      prefs.mood && `Mood: ${prefs.mood}`,
      prefs.listeningContext && `Context: ${prefs.listeningContext}`,
      prefs.additionalInfo
    ].filter(Boolean);

    const data = {
      user_id: userId,
      name: prefs.name || existing?.name || null,
      age: prefs.age || existing?.age || null,
      favorite_genres: mergedGenres ? JSON.stringify(mergedGenres) : null,
      favorite_bands: mergedBands ? JSON.stringify(mergedBands) : null,
      key_preferences: existing?.keyPreferences || null,
      important_context: contextParts.length > 0 ? contextParts.join('. ') : null,
      updated_at: this.db.fn.now(),
    };

    // Insere ou atualiza se o user_id já existir
    await this.db('user_preferences')
      .insert(data)
      .onConflict('user_id')
      .merge();
  }

  // Armazena um resumo completo da conversa
  async storeSummary(userId: string, summary: ConversationSummary): Promise<void> {
    await this.setup();

    const data = {
      user_id: userId,
      name: summary.name || null,
      age: summary.age || null,
      favorite_genres: summary.favoriteGenres ? JSON.stringify(summary.favoriteGenres) : null,
      favorite_bands: summary.favoriteBands ? JSON.stringify(summary.favoriteBands) : null,
      key_preferences: summary.keyPreferences,
      important_context: summary.importantContext || null,
      updated_at: this.db.fn.now(),
    };

    await this.db('user_preferences')
      .insert(data)
      .onConflict('user_id')
      .merge();
  }

  // Recupera o resumo completo de um usuário
  async getSummary(userId: string): Promise<ConversationSummary | null> {
    await this.setup();

    const row = await this.db('user_preferences')
      .where({ user_id: userId })
      .first();

    if (!row) return null;

    return {
      name: row.name || undefined,
      age: row.age || undefined,
      favoriteGenres: row.favorite_genres ? JSON.parse(row.favorite_genres) : undefined,
      favoriteBands: row.favorite_bands ? JSON.parse(row.favorite_bands) : undefined,
      keyPreferences: row.key_preferences,
      importantContext: row.important_context || undefined,
    };
  }

  // Retorna informações básicas formatadas para usar no prompt
  async getBasicInfo(userId: string): Promise<string | undefined> {
    const summary = await this.getSummary(userId);
    if (!summary) return undefined;

    const parts: string[] = [];

    if (summary.name) parts.push(`Nome: ${summary.name}`);
    if (summary.age) parts.push(`Idade: ${summary.age}`);
    if (summary.favoriteGenres?.length) {
      parts.push(`Gêneros Favoritos: ${summary.favoriteGenres.join(', ')}`);
    }
    if (summary.favoriteBands?.length) {
      parts.push(`Artistas/Bandas Favoritas: ${summary.favoriteBands.join(', ')}`);
    }
    if (summary.keyPreferences) {
      parts.push(`\nPreferências: ${summary.keyPreferences}`);
    }

    return parts.length > 0 ? parts.join('\n') : undefined;
  }

  // Fecha a conexão com o banco de dados
  async close(): Promise<void> {
    await this.db.destroy();
  }
}
