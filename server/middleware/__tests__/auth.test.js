const { protect, authorize } = require('../auth');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('protect middleware', () => {
  const OLD_ENV = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    process.env.JWT_SECRET = OLD_ENV;
  });

  it('rejects a request with no Authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('no token') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a request with a malformed or invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = jest.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches the decoded payload to req.user and calls next() for a valid token', () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 42, role: 'student' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 42, role: 'student' });
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('authorize middleware', () => {
  it('calls next() when req.user.role is in the allowed list', () => {
    const req = { user: { id: 1, role: 'mentor' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('mentor', 'admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when req.user.role is not in the allowed list', () => {
    const req = { user: { id: 1, role: 'student' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('mentor', 'admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
