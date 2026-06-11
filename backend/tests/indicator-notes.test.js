const request = require('supertest');
const app = require('../src/app');
const { ensureArea, cleanNotes, disconnect } = require('./helpers');

/**
 * Integration tests for the indicator-notes API.
 * Prerequisites: DATABASE_URL -> test DB with migration applied.
 * Covers tasks T011 (GET by context), T018 (upsert/edit/empty), T031 (handover), T037 (history isolation).
 */
describe('indicator-notes API', () => {
  let areaId;
  const code = 'test_indicator';
  const date = '2026-06-10';
  const shift = 1;

  beforeAll(async () => {
    const area = await ensureArea('Calcinação');
    areaId = area.id;
    await cleanNotes(areaId);
  });

  afterEach(async () => {
    await cleanNotes(areaId);
  });

  afterAll(async () => {
    await disconnect();
  });

  // T011 / T037
  it('returns an empty list for a context with no notes', async () => {
    const res = await request(app).get('/api/indicator-notes').query({ areaId, date, shift });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // T018
  it('upserts an apontamento and reports hasApontamento true; edit updates it', async () => {
    const create = await request(app)
      .post('/api/indicator-notes')
      .field('areaId', String(areaId))
      .field('indicatorCode', code)
      .field('date', date)
      .field('shift', String(shift))
      .field('content', '<p>Causa provável: incrustação.</p>');
    expect(create.status).toBe(200);
    expect(create.body.hasApontamento).toBe(true);

    const list = await request(app).get('/api/indicator-notes').query({ areaId, date, shift });
    expect(list.body).toHaveLength(1);
    expect(list.body[0].indicatorCode).toBe(code);

    const edit = await request(app)
      .post('/api/indicator-notes')
      .field('areaId', String(areaId))
      .field('indicatorCode', code)
      .field('date', date)
      .field('shift', String(shift))
      .field('content', '<p>Atualizado: ação tomada.</p>');
    expect(edit.body.content).toContain('Atualizado');

    const afterEdit = await request(app).get('/api/indicator-notes').query({ areaId, date, shift });
    expect(afterEdit.body).toHaveLength(1); // upsert, not duplicate
  });

  // T018: empty content does not count as apontamento and prunes the record
  it('does not persist an empty apontamento (no content, no attachment, no mark)', async () => {
    const res = await request(app)
      .post('/api/indicator-notes')
      .field('areaId', String(areaId))
      .field('indicatorCode', code)
      .field('date', date)
      .field('shift', String(shift))
      .field('content', '<p></p>');
    expect(res.body.removed).toBe(true);

    const list = await request(app).get('/api/indicator-notes').query({ areaId, date, shift });
    expect(list.body).toHaveLength(0);
  });

  // T031
  it('persists includedInHandover and toggles it via PATCH', async () => {
    const create = await request(app)
      .post('/api/indicator-notes')
      .field('areaId', String(areaId))
      .field('indicatorCode', code)
      .field('date', date)
      .field('shift', String(shift))
      .field('content', '')
      .field('includedInHandover', 'true');
    expect(create.body.includedInHandover).toBe(true);

    const patch = await request(app)
      .patch(`/api/indicator-notes/${create.body.id}/handover`)
      .send({ includedInHandover: false });
    // Unmarking an empty note removes it (persistence rule).
    expect(patch.body.removed).toBe(true);
  });

  // T037: history isolation across contexts
  it('isolates notes by date/shift', async () => {
    await request(app)
      .post('/api/indicator-notes')
      .field('areaId', String(areaId))
      .field('indicatorCode', code)
      .field('date', date)
      .field('shift', String(shift))
      .field('content', '<p>Turno 1.</p>');

    const otherShift = await request(app).get('/api/indicator-notes').query({ areaId, date, shift: 2 });
    expect(otherShift.body).toHaveLength(0);

    const otherDate = await request(app)
      .get('/api/indicator-notes')
      .query({ areaId, date: '2026-06-09', shift });
    expect(otherDate.body).toHaveLength(0);

    const sameCtx = await request(app).get('/api/indicator-notes').query({ areaId, date, shift });
    expect(sameCtx.body).toHaveLength(1);
  });
});
