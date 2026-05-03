import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
