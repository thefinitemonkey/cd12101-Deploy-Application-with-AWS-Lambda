import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { deleteTodo } from '../../businessLogic/todos.mjs'


export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true, origin: 'http://localhost:3000' }))
  .handler(async (event) => {
    // Create a logger instance
    const logger = createLogger('deleteTodo');
    logger.info('Processing event', { event })
    // Get the userId from the request
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    logger.info('Processing delete todo event', { todoId, userId });
    // Call the business logic function to create a new todo
    const todoItem = await deleteTodo({todoId, userId});

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
