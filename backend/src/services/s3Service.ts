import { S3Client, S3ClientConfig, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import config from '../config/environment.js';

export class S3Service {
  private connection: S3Client;
  private bucketName: string;

  private region: string;
  private endpoint: string | undefined;

  constructor() {
    this.endpoint = config.S3.ENDPOINT;
    this.region = config.S3.REGION!;

    // Base config for S3Client
    const clientConfig: S3ClientConfig = {
      region: this.region,
    }

    // Add extra config only for MinIO (IAM role handles AWS credentials when using the AWS deployment!)
    if (this.endpoint) {
      clientConfig.endpoint = this.endpoint;
      clientConfig.credentials = {
        accessKeyId: config.S3.ACCESS_KEY!,
        secretAccessKey: config.S3.SECRET_ACCESS_KEY!,
      };
      clientConfig.forcePathStyle = true;
    }

    this.connection = new S3Client(clientConfig);
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
      console.log(`${fileName} downloaded from S3 successfully`);
      return fileContent;
    } catch (error) {
      console.error(`Error downloading ${fileName} from S3:`, error);
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