export const MAX_FILE_SIZE = 5_242_880; // 5MB
export const SUPPORTED_UPLOAD_EXTENSIONS = ['.txt'] as const;
export const MAX_ANALYSIS_TEXT_LENGTH = 8000;
export const MIN_DETAILED_ANALYSIS_TEXT_LENGTH = 100;
export const COPY_RESET_DELAY_MS = 2000;

export const LLM_MODEL = 'gpt-4o-mini';
export const LLM_MAX_TOKENS = 800;
export const LLM_TEMPERATURE = 0.2;
export const DEFAULT_RECENT_ANALYSES_LIMIT = 10;

export const DEFAULT_SERVER_PORT = 5000;

export const PDF_FILE_PREFIX = 'analise-frameworks';
export const MARKDOWN_FILE_PREFIX = 'analise';
export const PDF_TEMPLATE_RELATIVE_PATH = ['reports', 'templates', 'analise.html'] as const;
export const PDF_PAGE_OPTIONS = {
  format: 'A4',
  margin: { top: '40px', bottom: '40px', left: '24mm', right: '24mm' },
} as const;
