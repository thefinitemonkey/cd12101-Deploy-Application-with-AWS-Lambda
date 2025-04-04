import { DynamoDB } from 'aws-sdk'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

export class TodosAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient;
    this.todosTable = todosTable;
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient);
  }

  async getTodos(userId) {
    console.log('Getting todos for userId: ', userId);
    // Query the database to get all todos for the given userId
    // Use the KeyConditionExpression to filter by userId
    // Use the ExpressionAttributeValues to provide the value for userId
    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    return result.Items;
  }
}
