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
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDBClient()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.docClient = DynamoDBDocumentClient.from(this.documentClient)
    this.logger = createLogger('auth')
  }

  async getTodos(userId) {
    this.logger.info('Getting todos', {
      userId,
      table: process.env.TODOS_TABLE,
      index: process.env.TODOS_USER_ID_INDEX,
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
  // Query the database to get all todos for the given userId
  // Use the KeyConditionExpression to filter by userId
  // Use the ExpressionAttributeValues to provide the value for userId
  //const result = await this.dynamoDbClient.query({
  //  TableName: this.todosTable,
  //  KeyConditionExpression: 'userId = :userId',
  //  ExpressionAttributeValues: {
  //    ':userId': userId
  //  }
  //});

  //return result.Items;
  // }
}
