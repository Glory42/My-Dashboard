import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  columnId: string;

  @IsInt()
  @Min(0)
  position: number;
}
