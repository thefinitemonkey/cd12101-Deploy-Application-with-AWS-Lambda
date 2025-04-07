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
      await this.dynamoDBClient.put(params);
      return todoObject;
    } catch (error) {
      this.logger.error('Error creating todo', error);
      throw new Error('Could not create todo');
    }
  }
}
