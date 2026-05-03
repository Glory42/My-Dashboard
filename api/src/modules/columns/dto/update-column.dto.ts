import { IsString, IsOptional } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
