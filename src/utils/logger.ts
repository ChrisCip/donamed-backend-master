/**
 * Sistema de Logging para Debug
 * Proporciona logs estructurados y coloreados para desarrollo
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const levelColors: Record<LogLevel, string> = {
  DEBUG: colors.gray,
  INFO: colors.blue,
  WARN: colors.yellow,
  ERROR: colors.red,
};

const levelIcons: Record<LogLevel, string> = {
  DEBUG: '🔍',
  INFO: 'ℹ️ ',
  WARN: '⚠️ ',
  ERROR: '❌',
};

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = this.formatTimestamp();
    const color = levelColors[level];
    const icon = levelIcons[level];

    // Formato legible para consola
    console.log(
      `${colors.gray}[${timestamp}]${colors.reset} ` +
      `${color}${icon} ${level}${colors.reset} ` +
      `${colors.cyan}[${this.context}]${colors.reset} ` +
      `${message}`
    );

    // Si hay datos adicionales, mostrarlos
    if (data !== undefined) {
      if (data instanceof Error) {
        console.log(`${colors.red}   └─ Error Name: ${data.name}${colors.reset}`);
        console.log(`${colors.red}   └─ Error Message: ${data.message}${colors.reset}`);
        if (data.stack) {
          console.log(`${colors.gray}   └─ Stack Trace:${colors.reset}`);
          console.log(`${colors.gray}${data.stack}${colors.reset}`);
        }
        // Mostrar propiedades adicionales del error (como code de Prisma)
        const errorAny = data as unknown as Record<string, unknown>;
        if (errorAny.code) {
          console.log(`${colors.yellow}   └─ Error Code: ${errorAny.code}${colors.reset}`);
        }
        if (errorAny.meta) {
          console.log(`${colors.yellow}   └─ Meta: ${JSON.stringify(errorAny.meta)}${colors.reset}`);
        }
      } else if (typeof data === 'object') {
        console.log(`${colors.gray}   └─ Data: ${JSON.stringify(data, null, 2)}${colors.reset}`);
      } else {
        console.log(`${colors.gray}   └─ Data: ${data}${colors.reset}`);
      }
    }
  }

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      this.formatMessage('DEBUG', message, data);
    }
  }

  info(message: string, data?: unknown): void {
    this.formatMessage('INFO', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.formatMessage('WARN', message, data);
  }

  error(message: string, data?: unknown): void {
    this.formatMessage('ERROR', message, data);
  }

  /**
   * Crea un logger con un contexto específico
   */
  static create(context: string): Logger {
    return new Logger(context);
  }
}

// Logger por defecto
const logger = new Logger('App');

export { Logger, logger };
export default logger;
