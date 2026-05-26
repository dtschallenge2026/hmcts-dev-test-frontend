import { Application } from 'express';
import axios from 'axios';

const backendUrl = 'http://localhost:4000';

export default function (app: Application): void {
  app.get('/tasks', async (req, res) => {
    try {
      const response = await axios.get(`${backendUrl}/tasks`);
      res.render('tasks/list', { tasks: response.data });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.render('tasks/list', { tasks: [] });
    }
  });

  app.get('/tasks/new', (req, res) => {
    res.render('tasks/create');
  });

  app.post('/tasks', async (req, res) => {
    try {
      await axios.post(`${backendUrl}/tasks`, req.body);
      res.redirect('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      res.render('tasks/create', { error: 'Failed to create task' });
    }
  });

  app.get('/tasks/:id', async (req, res) => {
    try {
      const response = await axios.get(`${backendUrl}/tasks/${req.params.id}`);
      res.render('tasks/view', { task: response.data });
    } catch (error) {
      console.error('Error fetching task:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        res.status(404).render('tasks/not-found');
      } else {
        res.redirect('/tasks');
      }
    }
  });

  app.get('/tasks/:id/edit-status', async (req, res) => {
    try {
      const response = await axios.get(`${backendUrl}/tasks/${req.params.id}`);
      res.render('tasks/edit-status', { task: response.data });
    } catch (error) {
      console.error('Error fetching task:', error);
      res.redirect('/tasks');
    }
  });

  app.post('/tasks/:id/edit-status', async (req, res) => {
    try {
      await axios.patch(`${backendUrl}/tasks/${req.params.id}/status`, req.body.status, {
        headers: { 'Content-Type': 'application/json' },
      });
      res.redirect(`/tasks/${req.params.id}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      res.redirect(`/tasks/${req.params.id}/edit-status`);
    }
  });

  app.post('/tasks/:id/delete', async (req, res) => {
    try {
      await axios.delete(`${backendUrl}/tasks/${req.params.id}`);
      res.redirect('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      res.redirect('/tasks');
    }
  });
}
