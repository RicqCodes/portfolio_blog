import { ContentBlockDto } from './dto/content.dto';

export class Helper {
  static AVERAGE_READING_SPEED = 225;

  private _countWords(contentArr: Array<ContentBlockDto>) {
    let textCount = 0;

    contentArr.forEach((entry: any) => {
      if (entry.type === 'text') {
        textCount += entry.content.trim().split(' ').length;
      }
    });

    return textCount;
  }

  static calculateReadingTime(contentArr: Array<ContentBlockDto>) {
    const wordCount = Helper.prototype._countWords.call(this, contentArr);
    const readingTimeMinutes = Math.ceil(
      wordCount / Helper.AVERAGE_READING_SPEED,
    );
    return readingTimeMinutes;
  }
}
