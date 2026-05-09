import { mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import pino from 'pino';
import { w4fLogger } from '../../src/common/w4nLogger.js';

const logDir = resolve(process.cwd(), 'Logs');
const logFile = resolve(logDir, 'test.log');

mkdirSync(logDir, { recursive: true });
// Remove previous test log so each run starts fresh
try {
    rmSync(logFile);
} catch {
    /* file may not exist */
}

const logger = pino({ level: 'trace' }, pino.destination({ dest: logFile, append: true, sync: true }));

w4fLogger.set(logger);

beforeEach((): void => {
    const testName = expect.getState().currentTestName;
    logger.info(`BEGIN TEST: ${testName}`);
});

afterEach((): void => {
    const testName = expect.getState().currentTestName;
    logger.info(`END TEST: ${testName}`);
});
