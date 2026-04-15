import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

interface AuditRecordInput {
  action: string;
  actor: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  async logWithClient(client: Prisma.TransactionClient, input: AuditRecordInput) {
    return client.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actor,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  }
}
