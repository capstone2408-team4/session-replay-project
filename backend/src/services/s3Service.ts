import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import config from '../config/environment';

export class S3Service {
  private connection: S3Client;
  private bucketName: string;

  // Storing region and endpoint as class properties for use in URL construction.
  // Revist this later
  private region: string;
  private endpoint: string | undefined;

  constructor() {
    this.endpoint = config.S3.ENDPOINT;
    this.region = config.S3.REGION!;

    this.connection = new S3Client({
      endpoint: this.endpoint, // Set for MinIO, leave undefined for AWS S3
      region: this.region,
      credentials: {
        accessKeyId: config.S3.ACCESS_KEY!,
        secretAccessKey: config.S3.SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Needed for MinIO, doesn't affect AWS S3
    });
    this.bucketName = config.S3.BUCKET_NAME!;
    this.createBucket();
  }

  private async createBucket(): Promise<void> {
    try {
      // Check if the bucket exists
      await this.connection.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`Bucket ${this.bucketName} exists in S3`);
    } catch (error: any) {
      if (error.name === 'NotFound') {
        // Bucket doesn't exist, create it
        await this.connection.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        console.log(`Bucket ${this.bucketName} created successfully`);
      } else {
        console.error(`Error checking bucket ${this.bucketName} existence in S3:`, error);
        throw error;
      }
    }
  }

  async addFile(fileName: string, fileContent: any): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: JSON.stringify(fileContent),
      ContentType: 'application/json',
    };

    try {
      const command = new PutObjectCommand(params);
      await this.connection.send(command);

      // Construct the URL
      const location = this.constructS3Url(fileName);
      console.log(`File uploaded successfully to S3 at: ${location}`);
      return location;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  async getFile(fileName: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    try {
      const command = new GetObjectCommand(params);
      const response = await this.connection.send(command);

      if (!response.Body) {
        throw new Error('File body is empty');
      }

      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      const fileContent = Buffer.concat(chunks).toString('utf-8');
      console.log('File downloaded from S3 successfully:', fileContent);
      return fileContent;
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw error;
    }
  }

  private constructS3Url(fileName: string): string {
    if (this.endpoint) {
      // For MinIO
      return `${this.endpoint}/${this.bucketName}/${fileName}`;
    } else {
      // For AWS S3
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
    }
  }
}