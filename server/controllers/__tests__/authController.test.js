jest.mock('../../config/db', () => ({
  pool: { query: jest.fn() },
}));

const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');
const { register, login } = require('../authController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(() => {
  pool.query.mockReset();
});

describe('register', () => {
  it('returns 400 when a required field is missing', async () => {
    const req = { body: { email: 'a@example.com' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 409 when the email is already registered', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // existing user found

    const req = { body: { name: 'Alex', email: 'alex@example.com', password: 'secret123' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('rejects a public registration attempt that requests the admin role', async () => {
    const req = { body: { name: 'Alex', email: 'alex@example.com', password: 'secret123', role: 'admin' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('hashes the password before storing it and returns a token', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // no existing user
      .mockResolvedValueOnce({ rows: [{ id: 5, name: 'Alex', email: 'alex@example.com', role: 'student' }] });

    const req = { body: { name: 'Alex', email: 'alex@example.com', password: 'secret123' } };
    const res = mockRes();

    await register(req, res);

    const insertCallParams = pool.query.mock.calls[1][1];
    const storedPassword = insertCallParams[2];
    expect(storedPassword).not.toBe('secret123');
    expect(await bcrypt.compare('secret123', storedPassword)).toBe(true);

    expect(res.status).toHaveBeenCalledWith(201);
    const jsonPayload = res.json.mock.calls[0][0];
    expect(jsonPayload.success).toBe(true);
    expect(typeof jsonPayload.token).toBe('string');
    expect(jsonPayload.user.password).toBeUndefined(); // never leak the hash back to the client
  });
});

describe('login', () => {
  it('returns 401 for an email that does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { body: { email: 'nobody@example.com', password: 'whatever' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the password does not match', async () => {
    const storedHash = await bcrypt.hash('correct-password', 10);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, name: 'Alex', email: 'alex@example.com', role: 'student', password: storedHash }],
    });

    const req = { body: { email: 'alex@example.com', password: 'wrong-password' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns a token when the password matches', async () => {
    const storedHash = await bcrypt.hash('correct-password', 10);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, name: 'Alex', email: 'alex@example.com', role: 'student', password: storedHash }],
    });

    const req = { body: { email: 'alex@example.com', password: 'correct-password' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonPayload = res.json.mock.calls[0][0];
    expect(typeof jsonPayload.token).toBe('string');
  });
});
