import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export enum TripStatusAction {
  MARK_FILLED = "MARK_FILLED",
  MARK_NOT_FILLED = "MARK_NOT_FILLED",
  MARK_DEPARTED = "MARK_DEPARTED",
  MARK_COMPLETED = "MARK_COMPLETED",
  MARK_CANCELLED = "MARK_CANCELLED",
}

export class ChangeTripStatusDto {
  @ApiProperty({
    name: "action",
    enum: TripStatusAction,
    enumName: "TripStatusAction",
    required: true,
    isArray: false,
  })
  @IsEnum(TripStatusAction)
  action: TripStatusAction;
}
