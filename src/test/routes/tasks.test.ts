import { app } from '../../main/app';

import { expect } from 'chai';
import nock from 'nock';
import request from 'supertest';

/* eslint-disable jest/expect-expect */

const backendUrl = 'http://localhost:4000';

const sampleTask = {
  id: 1,
  title: 'Test task',
  status: 'TODO',
  dueDateTime: '2026-06-01T10:00:00',
};

afterEach(() => {
  nock.cleanAll();
});

describe('Tasks page', () => {
  describe('on GET /tasks', () => {
    test('should render task list with tasks from backend', async () => {
      nock(backendUrl).get('/tasks').reply(200, [sampleTask]);

      await request(app)
        .get('/tasks')
        .expect(res => expect(res.status).to.equal(200));
    });

    test('should render empty task list when backend is unavailable', async () => {
      nock(backendUrl).get('/tasks').replyWithError('Network error');

      await request(app)
        .get('/tasks')
        .expect(res => expect(res.status).to.equal(200));
    });
  });

  describe('on GET /tasks/new', () => {
    test('should render the create task form', async () => {
      await request(app)
        .get('/tasks/new')
        .expect(res => expect(res.status).to.equal(200));
    });
  });

  describe('on POST /tasks', () => {
    test('should redirect to task list after successful creation', async () => {
      nock(backendUrl).post('/tasks').reply(201, sampleTask);

      await request(app)
        .post('/tasks')
        .send({ title: 'Test task', status: 'TODO', dueDateTime: '2026-06-01T10:00:00' })
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.location).to.equal('/tasks');
        });
    });

    test('should render create form with error when backend call fails', async () => {
      nock(backendUrl).post('/tasks').reply(400, { error: 'Validation failed' });

      await request(app)
        .post('/tasks')
        .send({ title: '' })
        .expect(res => expect(res.status).to.equal(200));
    });
  });

  describe('on GET /tasks/:id', () => {
    test('should render task view when task is found', async () => {
      nock(backendUrl).get('/tasks/1').reply(200, sampleTask);

      await request(app)
        .get('/tasks/1')
        .expect(res => expect(res.status).to.equal(200));
    });

    test('should return 404 when task is not found', async () => {
      nock(backendUrl).get('/tasks/99').reply(404);

      await request(app)
        .get('/tasks/99')
        .expect(res => expect(res.status).to.equal(404));
    });

    test('should redirect to task list on unexpected backend error', async () => {
      nock(backendUrl).get('/tasks/1').replyWithError('Server error');

      await request(app)
        .get('/tasks/1')
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.location).to.equal('/tasks');
        });
    });
  });

  describe('on POST /tasks/:id/delete', () => {
    test('should redirect to task list after successful deletion', async () => {
      nock(backendUrl).delete('/tasks/1').reply(204);

      await request(app)
        .post('/tasks/1/delete')
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.location).to.equal('/tasks');
        });
    });

    test('should redirect to task list even when deletion fails', async () => {
      nock(backendUrl).delete('/tasks/1').replyWithError('Server error');

      await request(app)
        .post('/tasks/1/delete')
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.location).to.equal('/tasks');
        });
    });
  });

  describe('on POST /tasks/:id/edit-status', () => {
    test('should redirect to task view after successful status update', async () => {
      nock(backendUrl).patch('/tasks/1/status').reply(200, { ...sampleTask, status: 'IN_PROGRESS' });

      await request(app)
        .post('/tasks/1/edit-status')
        .send({ status: 'IN_PROGRESS' })
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.location).to.equal('/tasks/1');
        });
    });

    test('should redirect back to edit form when status update fails', async () => {
      nock(backendUrl).patch('/tasks/1/status').reply(500);

      await request(app)
        .post('/tasks/1/edit-status')
        .send({ status: 'IN_PROGRESS' })
        .expect(res => {
          expect(res.status).to.equal(302);
          expect(res.headers.location).to.equal('/tasks/1/edit-status');
        });
    });
  });
});
