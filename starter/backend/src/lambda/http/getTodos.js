import middy from '@middy/core'
import { cors } from '@middy/http-cors'
import { httpErrorHandler } from '@middy/http-error-handler'
import { getTodos } from '../../businessLogic/todos.js'
import { getUserId } from '../utils.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    console.log('Processing event: ', event)
    // Get the userId from the request
    const userId = getUserId(event);
    // Call the business logic function to get the todos
    const todos = await getTodos(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })
