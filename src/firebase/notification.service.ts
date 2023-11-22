import { PrismaService } from "@app/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Trip } from "@prisma/client";
import { getMessaging } from "firebase-admin/messaging";

export type NotificationPayload = {
  event_type:
    | "TRIP_DEPARTED"
    | "TRIP_COMPLETED"
    | "TRIP_CANCELLED"
    | "PASSENGER_CANCELLED"
    | "PASSENGER_BOOKED";
  trip?: Trip;
};

export type NotifData = { user_id: string } & NotifDataWithoutUserId;

export type NotifDataWithoutUserId = {
  payload: NotificationPayload;
  body: string;
  title: string;
};

@Injectable()
export class NotificationService {
  constructor(private readonly db: PrismaService) {}

  async sendNotification({ user_id, payload, body, title }: NotifData) {
    try {
      const user =
        (await this.db.customer.findUnique({ where: { id: user_id } })) ??
        (await this.db.driver.findUnique({ where: { id: user_id } }));

      const token = user.device_token;

      if (!token) {
        return;
      }

      const res = await getMessaging().send({
        data: { payload: JSON.stringify(payload) },
        token,
        notification: { body, title },
      });
      console.info("Successfully sent notification from firebase:", res);

      return;
    } catch (e) {
      console.error("Error sending message/notification from firebase:", e);
    }
  }
}
