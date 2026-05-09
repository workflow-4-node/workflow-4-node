import { type Logger as PLogger } from 'pino';

export type Logger = Pick<PLogger, 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'> & {
    child(...args: Parameters<PLogger['child']>): Logger;
};

class W4FLogger implements Logger {
    private logger?: Logger;

    set(logger: Logger) {
        this.logger = logger;
    }

    fatal(...args: Parameters<Logger['fatal']>) {
        this.logger?.fatal(...args);
    }

    error(...args: Parameters<Logger['error']>) {
        this.logger?.error(...args);
    }

    warn(...args: Parameters<Logger['warn']>) {
        this.logger?.warn(...args);
    }

    info(...args: Parameters<Logger['info']>) {
        this.logger?.info(...args);
    }

    debug(...args: Parameters<Logger['debug']>) {
        this.logger?.debug(...args);
    }

    trace(...args: Parameters<Logger['trace']>) {
        this.logger?.trace(...args);
    }

    child(...args: Parameters<Logger['child']>): Logger {
        return this.logger?.child(...args) ?? this;
    }
}

export const w4fLogger = new W4FLogger();
