import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { createLogger } from '../utils/logger.mjs'


const todosAccess = new TodosAccess();
const logger = createLogger('businessLogicTodos');

export async function getTodos(userId) {
  return todosAccess.getTodos(userId);
}

export async function createTodo(userId, newTodo) {
  // Use the uuid package to generate a unique ID
  const todoId = uuid.v4();
  // Set the createdAt timestamp to the current time
  const createdAt = new Date().toISOString();

  const todoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo
  };

  // Make request to have new todo created in the database
  const result = await todosAccess.createTodo(todoItem);
  logger.info('Created todo at business logic', {result});
  return result;
}

export async function updateTodo({todoId, userId, updatedTodo}) {
  // Set the updatedAt timestamp to the current time
  const updatedAt = new Date().toISOString();

  const todoItem = {
    todoId,
    userId,
    ...updatedTodo,
    updatedAt
  };

  // Make request to have new todo created in the database
  const result = await todosAccess.updateTodo({todoId, userId, todoItem});
  return result;
}

export async function deleteTodo({todoId, userId}) {
  // Make request to have new todo created in the database
  const result = await todosAccess.deleteTodo({todoId, userId});
  return result;
}

export async function generateUploadUrl({ todoId, userId, attachmentUrl }) {
  // Make request to have new todo created in the database
  const result = await todosAccess.updateTodoAttachment({
    todoId,
    userId,
    attachmentUrl
  });
  return result;
}
