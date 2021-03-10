const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user;

  return next();
}

function checkExistsTodoTask(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(t => t.id === id);
  
  if (!todo) {
    return response.status(404).json({ error: 'Todo task not found' });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  let user = users.find(u => u.username === username);

  if (user) {
    return response.status(400).json({ error: 'User already exists' })
  }

  user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodoTask, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodoTask, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodoTask, (request, response) => {
  const { user, todo } = request;

  user.todos = user.todos.filter(t => t.id !== todo.id);

  return response.status(204).json(todo);
});

module.exports = app;