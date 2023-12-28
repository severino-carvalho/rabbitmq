import { Controller, Get } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get()
  publish() {
    return this.producerService.publish(
      'context_text',
      'testeAssertQueue',
      'testeAssertExchange',
    );
  }

  @Get('/init')
  init() {
    return this.producerService.onModuleInit();
  }
}
