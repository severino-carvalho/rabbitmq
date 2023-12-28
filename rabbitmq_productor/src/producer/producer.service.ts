import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private responseQueue: amqp.Replies.AssertQueue;

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await amqp.connect(
        'amqp://guest:guest@172.30.1.8:5672/severino',
      );

      this.channel = await this.connection.createChannel();

      this.channel.assertExchange('testeAssertExchange', 'fanout', {
        durable: false,
      });

      this.responseQueue = await this.channel.assertQueue('testeAssertQueue', {
        arguments: { 'x-queue-type': 'quorum' },
      });

      this.channel.consume(
        this.responseQueue.queue,
        (msg) => {
          console.log(msg.content.toString());
        },
        { noAck: true },
      );
    } catch (err) {
      Logger.error(err);

      process.exit(1);
    }
  }

  publish(
    content: string,
    routingKey: string,
    exchange = 'testeAssertExchange',
  ): void {
    this.channel.publish(exchange, routingKey, Buffer.from(content), {
      correlationId: randomUUID(),
      replyTo: this.responseQueue.queue,
    });
  }

  onModuleDestroy(): void {
    this.connection.close();
  }
}
