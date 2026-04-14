import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  async processPending(limit = 50) {
    const outboxEvents = await (this.prisma as any).outboxEvent.findMany({
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    for (const event of outboxEvents) {
      if (event.processedAt) {
        continue;
      }

      await (this.prisma as any).outboxEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });

      this.logger.debug('Processed outbox event ' + event.id + ' (' + event.type + ')');
    }

    return { processed: outboxEvents.length };
  }
}
