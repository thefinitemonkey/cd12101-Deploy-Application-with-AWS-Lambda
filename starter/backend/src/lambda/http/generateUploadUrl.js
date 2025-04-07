import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as uuid from 'uuid'
import { TodosAccess } from '../../dataLayer/todosAccess.mjs'

const s3Client = new S3Client()
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const todosAccess = new TodosAccess();

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true, origin: 'http://localhost:3000' }))
  .handler(async (event) => {
    const eventInfo = JSON.parse(event.body)
    const todoId = eventInfo.todoId;
    const userId = getUserId(event)
    // Create a logger instance
    const logger = createLogger('generateUploadUrl')
    logger.info('Processing event', { eventInfo })

    const imageId = uuid.v4()
    logger.info('Processing URL generation', { todoId, userId, imageId })

    // Update the todo item with the image URL
    const imageUrl = `https://${process.env.IMAGES_S3_BUCKET}.s3.amazonaws.com/${imageId}`;
    const updateResult = await todosAccess.updateTodoAttachment({
      todoId,
      userId,
      attachmentUrl: imageUrl
    });
    logger.info('Updated todo item with image URL', { updateResult });

    // Call the S3 command to generate a signed URL
    const params = {
      Bucket: process.env.IMAGES_S3_BUCKET,
      Key: imageId
    }
    logger.info('Generating signed URL', { params })
    const command = new PutObjectCommand(params)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })
    logger.info('Generated signed URL', { uploadUrl })



    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  })
