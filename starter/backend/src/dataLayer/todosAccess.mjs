import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocument,
  DynamoDBDocumentClient,
  QueryCommand
} from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

import { createLogger } from '../utils/logger.mjs'

export class TodosAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    gsiDocumentClient = AWSXRay.captureAWSv3Client(new DynamoDBClient()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.todosTable = todosTable
    // Primary table schema reference for PUT/PATCH/DELETE
    this.documentClient = documentClient
    this.dynamoDBClient = DynamoDBDocument.from(this.documentClient)
    // GSI table schema reference for query by userId
    this.gsiDocumentClient = gsiDocumentClient
    this.docClient = DynamoDBDocumentClient.from(this.gsiDocumentClient)

    this.logger = createLogger('todosAccess')
  }

  async getTodos(userId) {
    this.logger.info('Getting todos', {
      userId,
      table: process.env.TODOS_TABLE,
      index: process.env.TODOS_USER_ID_INDEX
    })

    // Check if the userId is provided
    if (!userId) {
      this.logger.error('UserId is not provided')
      throw new Error('UserId is required')
    }

    const params = {
      TableName: process.env.TODOS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      IndexName: process.env.TODOS_USER_ID_INDEX
    }
    const result = await this.docClient.send(new QueryCommand(params))
    this.logger.info('Todos retrieved successfully', {
      result
    });
    return result.Items
  }

  async createTodo(todoObject) {
    const params = {
      TableName: process.env.TODOS_TABLE,
      Item: todoObject
    }
    this.logger.info('Storing todo in DynamoDB', {
      params
    })

    try {
      const result = await this.dynamoDBClient.put(params);
      this.logger.info('Todo created successfully', {
        result
      })
      return todoObject;
    } catch (error) {
      this.logger.error('Error creating todo', error);
      throw new Error('Could not create todo');
    }
  }

  async updateTodo({todoId, userId, todoItem}) {
    // Get the new value for the done attribute as a number
    // If done is not provided, default to false
    const done = +(todoItem.done !== undefined ? todoItem.done : false);
    this.logger.info('Updating todo done value', { done });

    const params = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set done = :done',
      ExpressionAttributeValues: {
        ':done': done
      }
    }
    this.logger.info('Updating todo in DynamoDB', {
      params
    })

    try {
      const result = await this.dynamoDBClient.update(params);
      return result;
    } catch (error) {
      this.logger.error('Error updating todo', error);
      throw new Error('Could not update todo');
    }
  }

  async updateTodoAttachment( {todoId, userId, attachmentUrl} ) {
    // Set parameters for the update operation
    const params = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }
    // Log the parameters for debugging
    this.logger.info('Updating todo attachment in DynamoDB', {
      params
    })

    try {
      const result = await this.dynamoDBClient.update(params);
      return result;
    } catch (error) {
      this.logger.error('Error updating todo attachment', error);
      throw new Error('Could not update todo attachment');
    }
  }

  async deleteTodo({todoId, userId}) {
    const params = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        userId,
        todoId
      }
    }
    this.logger.info('Deleting todo in DynamoDB', {
      params
    })

    try {
      const result = await this.dynamoDBClient.delete(params);
      return result;
    } catch (error) {
      this.logger.error('Error deleting todo', error);
      throw new Error('Could not delete todo');
    }
  }
}