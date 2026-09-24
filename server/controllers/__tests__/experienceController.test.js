jest.mock('../../config/db', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = require('../../config/db');
const { createExperience, deleteExperience } = require('../experienceController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  pool.query.mockReset();
});

describe('createExperience', () => {
  it('returns 400 when a required field is missing', async () => {
    const req = { body: { organization: 'Acme' }, user: { id: 3 } };
    const res = mockRes();

    await createExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('always uses req.user.id as the owner, ignoring any client-supplied student id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 99, student_id: 3 }] });

    const req = {
      body: { type: 'internship', organization: 'Acme', role: 'Intern', student: 999 },
      user: { id: 3, role: 'student' },
    };
    const res = mockRes();

    await createExperience(req, res);

    const [, params] = pool.query.mock.calls[0];
    expect(params[0]).toBe(3); // student_id bound param must be req.user.id, not 999
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('deleteExperience', () => {
  it('returns 404 when the experience does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { params: { id: '1' }, user: { id: 3, role: 'student' } };
    const res = mockRes();

    await deleteExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('lets the owning student delete their own experience', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ student_id: 3 }] }) // ownership lookup
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // delete

    const req = { params: { id: '1' }, user: { id: 3, role: 'student' } };
    const res = mockRes();

    await deleteExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('forbids a student from deleting someone else\'s experience', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ student_id: 3 }] }); // owned by student 3

    const req = { params: { id: '1' }, user: { id: 7, role: 'student' } }; // different student
    const res = mockRes();

    await deleteExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(pool.query).toHaveBeenCalledTimes(1); // never reaches the DELETE query
  });

  it('lets a mentor delete an experience they do not own', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ student_id: 3 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const req = { params: { id: '1' }, user: { id: 999, role: 'mentor' } };
    const res = mockRes();

    await deleteExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
