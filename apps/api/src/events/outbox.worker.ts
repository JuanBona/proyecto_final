import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  async processPending(limit = 50) {
    const outboxEvents = await this.prisma.outboxEvent.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    for (const event of outboxEvents) {
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date(), status: 'processed', attempts: event.attempts + 1 },
      });

      this.logger.debug('Processed outbox event ' + event.id + ' (' + event.eventType + ')');
    }

    return { processed: outboxEvents.length };
  }
}
