import { IsString } from 'class-validator';

export class ContentBlockTitleDto {
  @IsString()
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

  @IsString()
  text: string;
}
