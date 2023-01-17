import pino from 'pino';
import * as FileStreamRotator from 'file-stream-rotator';
import { v4 } from 'uuid';

type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export default () => {
  const LOG_LEVEL = process.env.LOGGING_DEBUG ? 'debug' : 'info';
  // 로그 파일 관리 스트림 생성
  const rotatingLogStream = FileStreamRotator.getStream({
    filename: `${process.env.LOGGING_PATH}/${LOG_LEVEL}/${LOG_LEVEL}-%DATE%`, // 파일 위치 & 이름
    frequency: '1h', // 주기 설정
    date_format: 'YYYY-MM-DD-HH', // 데이터 포멧 설정
    size: process.env.LOGGING_MAXSIZE, // 최대 파일 크기 설정
    max_logs: process.env.LOGGING_MAXFILES, // 파일 로깅
    audit_file: `${process.env.LOGGING_PATH}/audit.json`, // 정보 파일
    extension: '.log', // 로그 확장자
    create_symlink: true, // 링크 파일 여부
    symlink_name: 'tail-current.log', //링크 파일 명
  });

  return {
    logginConfig: {
      pinoHttp: {
        genReqId: function (req, res) { // req - id 를 uuid로 생성
          const uuid = v4();
          res.header('X-Request-Id', uuid);
          return uuid;
        },
        transport: LOG_LEVEL === 'debug' // debug일 경우 pretty 처리 
        ? { target: 'pino-pretty' }
        : undefined,
        level: LOG_LEVEL, // 여기에도 있고, stream 상세에도 있어야 정상 동작 한다
        stream: pino.multistream([ // multistream으로 여러군데 동시 출력
          {
            stream: rotatingLogStream,
            level: LOG_LEVEL as Level,
          },
          {
            stream: process.stdout, // 콘솔에 출력
            level: process.env.LOGGING_CONSOLE_LEVEL as Level,
          },
        ]),
        formatters: { // 로그 표시시 포멧
          level(level) {
            return { level };
          },
        },
        redact: { // 로그 표기시 제외 처리 
          remove: true,
          paths: [
            'email',
            'password',
            'req.query',
            'req.params',
            'req.query',
            'res.headers',
            'req.headers.host',
            'req.headers.connection',
            'req.headers.accept',
            'req.headers.origin',
            'req.headers.referer',
            'req.headers["content-type"]',
            'req.headers["sec-ch-ua"]',
            'req.headers["sec-ch-ua-mobile"]',
            'req.headers["user-agent"]',
            'req.headers["sec-ch-ua-platform"]',
            'req.headers["sec-fetch-site"]',
            'req.headers["sec-fetch-mode"]',
            'req.headers["sec-fetch-dest"]',
            'req.headers["accept-encoding"]',
            'req.headers["accept-language"]',
            'req.headers["if-none-match"]',
          ],
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
    },
  };
};