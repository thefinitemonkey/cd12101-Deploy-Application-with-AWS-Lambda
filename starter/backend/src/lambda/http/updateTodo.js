import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { updateTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true, origin: 'http://localhost:3000' }))
  .handler(async (event) => {
    // Create a logger instance
    const logger = createLogger('updateTodo');
    const todoId = event.pathParameters.todoId;
    // Get the userId from the request
    const userId = getUserId(event)
    // Populate todo object from the request body and default values
    const updatedTodo = JSON.parse(event.body)

    logger.info('Processing update todo event', { todoId, userId, updatedTodo })
    // Call the business logic function to create a new todo
    const todoItem = await updateTodo({todoId, userId, updatedTodo})

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todoItem
      })
    }
  })
