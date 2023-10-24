import { IsString, IsUrl } from 'class-validator';

export class ContentBlockLinkDto {
  @IsString()
  text: string;

  @IsUrl()
  url: string;
}
