import { IsString, IsEnum } from 'class-validator';

export class ContentBlockListItemDto {
  @IsString()
  @IsEnum(['ordered', 'unordered'])
  type: 'ordered' | 'unordered';

  @IsString({ each: true })
  content: string[];
}
