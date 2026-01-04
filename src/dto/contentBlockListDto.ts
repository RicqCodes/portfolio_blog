import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';

export class ContentBlockListItemDto {
  @IsString()
  @IsEnum(['ordered', 'unordered'])
  type: 'ordered' | 'unordered';

  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  content: string[];
}
