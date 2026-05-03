import { IsString, IsNotEmpty } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}
