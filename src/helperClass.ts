import { ContentBlockDto } from './dto/content.dto';

export class Helper {
  static AVERAGE_READING_SPEED = 225;

  private static countWords(contentArr: Array<ContentBlockDto>) {
    let textCount = 0;

    contentArr.forEach((entry) => {
      if (entry.type !== 'text') return;
      const content = entry.content?.trim();
      if (!content) return;
      textCount += content.split(/\s+/).length;
    });

    return textCount;
  }

  static calculateReadingTime(contentArr: Array<ContentBlockDto>) {
    const wordCount = Helper.countWords(contentArr);
    const readingTimeMinutes = Math.ceil(
      wordCount / Helper.AVERAGE_READING_SPEED,
    );
    return readingTimeMinutes;
  }
}
