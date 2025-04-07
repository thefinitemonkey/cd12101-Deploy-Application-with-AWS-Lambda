import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/todosAccess.mjs'

const todosAccess = new TodosAccess()

export async function getTodos(userId) {
  return todosAccess.getTodos(userId)
}

export async function createTodo(userId, newTodo) {
  // Use the uuid package to generate a unique ID
  const todoId = uuid.v4()
  // Set the createdAt timestamp to the current time
  const createdAt = new Date().toISOString()

  const todoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo
  }

  // Make request to have new todo created in the database
  const result = await todosAccess.createTodo(todoItem)
  return result
}
