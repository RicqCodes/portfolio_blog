import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ContentBlockListItemDto } from './contentBlockListDto';
import { ContentBlockLinkDto } from './contentBlockLinkDto';
import { Type } from 'class-transformer';
import { ContentBlockTitleDto } from './contentBlockTitleDto';

export class ContentBlockDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['text', 'heading', 'divider', 'image', 'video', 'code', 'list'])
  type: 'text' | 'heading' | 'divider' | 'image' | 'video' | 'code' | 'list';

  @IsOptional()
  @ValidateNested()
  @Type(() => ContentBlockTitleDto)
  title: { type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'; text: string };

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContentBlockListItemDto)
  list: { type: 'ordered' | 'unordered'; content: string[] };

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockLinkDto)
  links: ContentBlockLinkDto[];

  @IsOptional()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  codeType: string;
}
