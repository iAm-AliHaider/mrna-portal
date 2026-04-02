import AWS from 'aws-sdk'
import S3 from 'aws-sdk/clients/s3'

export const uploadFile = async file => {
  const S3_BUCKET = process.env.REACT_APP_AWS_BUCKET
  const REGION = process.env.REACT_APP_AWS_REGION

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  })

  const s3 = new S3({
    params: { Bucket: S3_BUCKET },
    region: REGION
  })

  const params = {
    Bucket: S3_BUCKET,
    Key: file.name,
    Body: file
  }

  try {
    await s3.putObject(params).promise()
    const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${params.Key}`
    return fileUrl
  } catch (error) {
    console.error(error)
  }
}
