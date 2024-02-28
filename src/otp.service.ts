import { Injectable } from "@nestjs/common";
import { customAlphabet } from "nanoid";
import { WhatsappService } from "./whatsapp.service";

@Injectable()
export class OtpService {
  private rng: () => string;

  constructor(private readonly wa: WhatsappService) {
    this.rng = customAlphabet("1234567890", 6);
  }

  private generateOtp(): string {
    return this.rng();
  }

  public async sendOtp(phone: string): Promise<string> {
    const otp = this.generateOtp();

    await this.wa.sendMessage(phone, `Код для входа: ${otp}`);

    return otp;
  }
}
