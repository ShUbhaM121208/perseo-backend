// Global test setup
import { jest } from '@jest/globals';
// Mock process.env for tests
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
// Increase test timeout for async operations
jest.setTimeout(10000);
// Suppress console.logs during tests unless NODE_ENV=test-verbose
if (process.env.NODE_ENV === 'test' && process.env.NODE_ENV !== 'test-verbose') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
    };
}
//# sourceMappingURL=setup.js.map