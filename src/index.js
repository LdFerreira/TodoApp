const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(400).json({error: 'User not found'})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const userAlreadyExist = users.some(user => user.username === username)
  
  if(userAlreadyExist) {
    return response.status(400).json({error: 'User already exists!'})
  }
  
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  } 
  
  users.push(user)
  response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline } = request.body

  const { user } = request;
  // const dateFormat = new Date(deadline + " 00:00");

  const ToDoOperation = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(ToDoOperation)

  return response.status(201).json(ToDoOperation)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline} = request.body;
  // const dateFormat = new Date(deadline + " 00:00");
  
  const userToUpdate = user.todos.find(userTodo => userTodo.id === id);
  if(!userToUpdate) {
    return response.status(404).json({error: 'Mensagem do erro'})
  }
  userToUpdate.title = title;
  userToUpdate.deadline = new Date(deadline);

  return response.status(201).json(userToUpdate)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const toDoToUpdate = user.todos.find(userTodo => userTodo.id === id);

  if(!toDoToUpdate) {
    return response.status(404).json({error: 'Mensagem do erro'})
  }
  toDoToUpdate.done = true

  return response.status(201).json(toDoToUpdate)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const { id } = request.params;
  const toDoToDelete = user.todos.findIndex(userTodo => userTodo.id === id);
  if(toDoToDelete === -1) {
    return response.status(404).json({error: 'Mensagem do erro'})
  }
  user.todos.splice(toDoToDelete, 1);
  return response.status(204).json({ok: true})
});

module.exports = app;