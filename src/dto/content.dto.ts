import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class ContentBlockDto {
  @IsString()
  @IsNotEmpty()
  type: 'text' | 'image' | 'video' | 'list' | 'code';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
