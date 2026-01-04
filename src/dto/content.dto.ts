import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  ValidateIf,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
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

  @ValidateIf((o) => o.type === 'heading')
  @ValidateNested()
  @Type(() => ContentBlockTitleDto)
  title?: { type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'; text: string };

  @ValidateIf(
    (o) =>
      o.type === 'text' ||
      o.type === 'code' ||
      o.type === 'video',
  )
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ValidateIf((o) => o.type === 'list')
  @ValidateNested()
  @Type(() => ContentBlockListItemDto)
  list?: { type: 'ordered' | 'unordered'; content: string[] };

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockLinkDto)
  links?: ContentBlockLinkDto[];

  @ValidateIf((o) => o.type === 'image')
  @IsImageUrl()
  imageUrl?: string;

  @ValidateIf((o) => o.type === 'code')
  @IsString()
  @IsNotEmpty()
  codeType?: string;
}

function IsImageUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsImageUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          if (value.startsWith('/uploads/')) return true;
          try {
            const parsed = new URL(value);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a URL address`;
        },
      },
    });
  };
}
