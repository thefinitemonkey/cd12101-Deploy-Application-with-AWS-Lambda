import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { createTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true, origin: 'http://localhost:3000' }))
  .handler(async (event) => {
    // Get the userId from the request
    const userId = getUserId(event)
    // Populate todo object from the request body and default values
    const newTodo = JSON.parse(event.body)

    // Create a logger instance
    const logger = createLogger('createTodo')

    logger.info('Processing create todo event', { userId, newTodo })
    // Call the business logic function to create a new todo
    const todoItem = await createTodo(userId, newTodo)

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
