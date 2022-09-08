import * as Transport from 'winston-transport';
import * as winston from 'winston';
import * as path from 'path';

import WinstonDaily = require('winston-daily-rotate-file');

const getTransport = (): [Transport] => {
  const transports: [Transport] = [
    new WinstonDaily({
      dirname: path.join(process.env.LOGGING_PATH, '/info/'),
      filename: 'info-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      level: 'info',
      zippedArchive: process.env.LOGGING_ZIP === 'true',
      maxFiles: process.env.LOGGING_MAXFILES,
    }),
  ];

  // LOGGING_DEBUG 가 true 일 경우만 추가
  if (process.env.LOGGING_DEBUG === 'true') {
    transports.push(
      new WinstonDaily({
        dirname: path.join(process.env.LOGGING_PATH, '/debug/'), // 파일 저장 위치
        filename: 'debug-%DATE%.log', // 파일 명
        datePattern: 'YYYY-MM-DD-HH', // 파일명의 날짜(DATE) 패턴
        level: 'debug', // 로그 레벨
        zippedArchive: process.env.LOGGING_ZIP === 'true', //압축 여부
        maxFiles: process.env.LOGGING_MAXFILES, // 파일의 최대 유지 날짜
      }),
    );
  }

  return transports;
};

export default () => ({
  logginConfig: {
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        level: process.env.LOGGING_CONSOLE_LEVEL,
      }),
      ...getTransport(),
    ],
  },
});
