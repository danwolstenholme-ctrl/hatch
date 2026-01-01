import { checkAndIncrementGeneration } from './lib/db/users';

// Mock Supabase Admin
jest.mock('./lib/supabase', () => ({
  supabaseAdmin: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

import { supabaseAdmin } from './lib/supabase';

describe('Generation Limits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Paid users have unlimited generations', async () => {
    const result = await checkAndIncrementGeneration('user_123', true);
    expect(result).toEqual({ allowed: true, remaining: -1 });
    expect(supabaseAdmin!.rpc).not.toHaveBeenCalled();
  });

  test('Free users are checked against limit', async () => {
    (supabaseAdmin!.rpc as jest.Mock).mockResolvedValue({
      data: [{ allowed: true, remaining: 4 }],
      error: null
    });

    const result = await checkAndIncrementGeneration('user_123', false);
    expect(result).toEqual({ allowed: true, remaining: 4 });
    expect(supabaseAdmin!.rpc).toHaveBeenCalledWith('check_and_increment_generation', {
      p_clerk_id: 'user_123',
      p_daily_limit: 5,
    });
  });

  test('Free users are blocked when limit reached', async () => {
    (supabaseAdmin!.rpc as jest.Mock).mockResolvedValue({
      data: [{ allowed: false, remaining: 0 }],
      error: null,
    });

    const result = await checkAndIncrementGeneration('user_123', false);
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  test('Fail open on RPC error', async () => {
    (supabaseAdmin!.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'RPC failed' },
    });

    const result = await checkAndIncrementGeneration('user_123', false);
    expect(result).toEqual({ allowed: true, remaining: 5 });
  });
});
