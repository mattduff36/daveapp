import { vi } from "vitest";

type SupabaseResult = { data?: unknown; error?: { message: string } | null };

/**
 * Creates a fluent Supabase query mock that supports arbitrary `.eq()` depth
 * and resolves to the provided value when awaited.
 */
export function createSupabaseChain<T extends SupabaseResult>(resolvedValue: T) {
  const promise = Promise.resolve(resolvedValue);

  const chain: Record<string, unknown> = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };

  for (const method of [
    "select",
    "eq",
    "ilike",
    "order",
    "limit",
    "update",
    "delete",
  ] as const) {
    chain[method] = vi.fn(() => chain);
  }

  chain.maybeSingle = vi.fn(() => promise);
  chain.single = vi.fn(() => promise);
  chain.insert = vi.fn(() => promise);

  return chain;
}

export function createSupabaseUpdateChain(error: { message: string } | null = null) {
  return createSupabaseChain({ error });
}

export function createSupabaseSelectChain(data: unknown) {
  return createSupabaseChain({ data, error: null });
}
