import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const winstonLogger = winston.createLogger({
  level: 'info', // Mức log tối thiểu
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Định dạng thời gian
    winston.format.json(), // Log JSON để ghi ra file
  ),
  transports: [
    // ✅ Ghi log ra console với format mặc định của NestJS
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(), // Giữ nguyên format mặc định của NestJS
      ),
    }),
    // ✅ Ghi log lỗi ra file theo ngày
    new DailyRotateFile({
      filename: 'src/logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // ✅ Ghi toàn bộ log ra file theo ngày
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
