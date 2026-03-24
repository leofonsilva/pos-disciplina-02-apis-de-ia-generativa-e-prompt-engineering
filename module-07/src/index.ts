import { createServer } from './server.ts';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import FormData from 'form-data';

// Configuração para resolução de caminhos absolutos
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cria uma instância do servidor Fastify
const app = createServer();

// Inicia o servidor na porta 4000, disponível em todas as interfaces
await app.listen({ port: 4000, host: '0.0.0.0' });
console.log(`
╔════════════════════════════════════════╗
║   Document Q&A Pipeline Server         ║
║   Running on http://0.0.0.0:4000       ║
╚════════════════════════════════════════╝

Available endpoint:
  • POST /chat  - Upload PDF and ask a question

Example usage:
  curl -X POST -F "file=@document.pdf" -F "question=What is this about?" \\
    http://localhost:4000/chat
`);

// Teste automático com documento padrão ao iniciar o servidor
(async () => {
  try {
    // Caminho para o documento de exemplo
    const filename = 'a-comprehensive-overview-of-large-language-models.pdf'
    const pdfPath = join(__dirname, '..', 'docs', filename);
    const pdfBuffer = await fs.readFile(pdfPath);

    console.log('Testing with default document...\n');

    // Prepara o formulário multipart com arquivo e pergunta
    const formData = new FormData();
    formData.append('file', pdfBuffer, {
      filename,
      contentType: 'application/pdf',
    });
    formData.append('question', 'describe what\'s on this document');

    // Envia requisição para o servidor
    const response = await app.inject({
      method: 'POST',
      url: '/chat',
      headers: formData.getHeaders(),   // Headers do multipart
      payload: formData,                // Dados do formulário
    });

    const result = JSON.parse(response.body);

    // Exibe a resposta da IA
    console.log('AI Response:');
    console.log(result.answer);
    console.log('\n');

  } catch (error) {
    console.error('Could not run default test:', error instanceof Error ? error.message : error);
  }
})();
