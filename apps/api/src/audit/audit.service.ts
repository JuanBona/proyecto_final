import { Injectable } from '@nestjs/common';

interface AuditRecordInput {
  action: string;
  actor: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  async logWithClient(client: unknown, input: AuditRecordInput) {
    const auditClient = (client as { auditLog?: { create?: (args: unknown) => Promise<unknown> } }).auditLog;

    if (!auditClient?.create) {
      return null;
    }

    return auditClient.create({
      data: {
        action: input.action,
        actor: input.actor,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  }
}
