import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";

export interface MessagingService {
  sendMessage: (phone: string, message: string) => Promise<void>;
}

type WAResponse = {
  message: string;
  item: {
    to: string;
    msg: string;
    status: string;
  };
};

@Injectable()
export class WhatsappService implements MessagingService {
  constructor(
    private readonly http: HttpService,
    private readonly env: ConfigService,
  ) {}

  public async sendMessage(phone: string, message: string): Promise<void> {
    await firstValueFrom(
      this.http
        .post<WAResponse>(
          "/queues/push",
          {
            to: phone,
            msg: message,
          },
          {
            baseURL: this.env.get("WA_API_URL"),
            headers: {
              Authorization: `Bearer ${this.env.get("WA_API_SECRET")}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
  }
}
