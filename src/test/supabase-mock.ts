import { vi } from "vitest";

/**
 * Create a PostgrestError object matching Supabase API responses
 * Useful for testing error scenarios
 */
export const createPostgrestError = (overrides?: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}): { code: string; message: string; details: string; hint: string } => {
  return {
    code: "PGRST001",
    message: "Database error",
    details: "",
    hint: "",
    ...overrides,
  };
};

/**
 * Create a query builder mock that supports method chaining
 * Handles select, insert, update, delete, eq, order operations
 */
export const createMockQueryBuilder = (
  responseData: any = null,
  error: any = null
) => {
  const mockResponse = { data: responseData, error };

  const chainable: any = {};

  // Define methods that return chainable
  chainable.select = vi.fn().mockReturnValue(chainable);
  chainable.insert = vi.fn().mockReturnValue(chainable);
  chainable.update = vi.fn().mockReturnValue(chainable);
  chainable.delete = vi.fn().mockReturnValue(chainable);
  chainable.eq = vi.fn().mockReturnValue(chainable);
  chainable.neq = vi.fn().mockReturnValue(chainable);
  chainable.in = vi.fn().mockReturnValue(chainable);
  chainable.order = vi.fn().mockReturnValue(chainable);
  chainable.then = vi.fn((onFulfilled) => {
    return Promise.resolve(mockResponse).then(onFulfilled);
  });
  chainable.catch = vi.fn();

  return chainable;
};

/**
 * Create a realistic mock Supabase client
 * Configure with specific return values for each test
 */
export const createMockSupabaseClient = (): any => {
  return {
    from: vi.fn((_table: string) => createMockQueryBuilder()),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(),
    },
  };
};

/**
 * Helper to configure a mock Supabase client for a specific test
 * Simple version that creates a mock with pre-configured response
 */
export const configureMockSupabaseClient = (
  responseData: any = null,
  error: any = null
): any => {
  const mockQuery = createMockQueryBuilder(responseData, error);
  return {
    from: vi.fn().mockReturnValue(mockQuery),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(),
    },
  };
};

/**
 * Create a mock query response with success data
 */
export const createSuccessResponse = (data: any) => ({
  data,
  error: null,
});

/**
 * Create a mock query response with error
 */
export const createErrorResponse = (error: any) => ({
  data: null,
  error,
});
