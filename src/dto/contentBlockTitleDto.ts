import { IsNotEmpty, IsString } from 'class-validator';

export class ContentBlockTitleDto {
  @IsString()
  @IsNotEmpty()
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

  @IsString()
  @IsNotEmpty()
  text: string;
}
