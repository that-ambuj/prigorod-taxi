import { Injectable } from "@nestjs/common";
import { customAlphabet } from "nanoid";

@Injectable()
export class OtpService {
  private rng: () => string;

  constructor() {
    this.rng = customAlphabet("1234567890", 6);
  }

  public generateOtp(): string {
    return this.rng();
  }
}
