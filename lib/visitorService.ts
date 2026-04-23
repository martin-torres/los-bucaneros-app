import type { VisitorRecord } from '../types';
import pbClient from './pocketbase';

export const visitorApi = {
  async upsertVisitor(visitorData: Partial<VisitorRecord>): Promise<VisitorRecord> {
    const existingRecords = await pbClient.collection('visitors').getFullList({
      filter: `sessionId="${visitorData.sessionId}"`,
      limit: 1
    });

    if (existingRecords.length > 0) {
      const record = existingRecords[0];
      return await pbClient.collection('visitors').update(record.id, {
        ...visitorData,
        lastVisit: new Date().toISOString(),
        visitCount: record.visitCount + 1
      });
    } else {
      return await pbClient.collection('visitors').create({
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        visitCount: 1,
        ...visitorData
      });
    }
  },

  async associateVisitorWithOrder(visitorId: string, orderId: string): Promise<void> {
    try {
      const visitor = await pbClient.collection('visitors').getOne(visitorId, {});
      const currentOrders = visitor.associatedOrders as string[] || [];
      if (!currentOrders.includes(orderId)) {
        await pbClient.collection('visitors').update(visitorId, {
          associatedOrders: [...currentOrders, orderId]
        });
      }
    } catch (error) {
      console.error('Error associating visitor with order:', error);
      throw error;
    }
  },

  async getVisitorBySessionId(sessionId: string): Promise<VisitorRecord | null> {
    try {
      const records = await pbClient.collection('visitors').getFullList({
        filter: `sessionId="${sessionId}"`,
        limit: 1
      });
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Error fetching visitor by session ID:', error);
      return null;
    }
  }
};