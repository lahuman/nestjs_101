import pino from 'pino';
import * as FileStreamRotator from 'file-stream-rotator';
import { v4 } from 'uuid';

type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export default () => {
  const LOG_LEVEL = process.env.LOGGING_DEBUG ? 'debug' : 'info';
  const rotatingLogStream = FileStreamRotator.getStream({
    filename: `${process.env.LOGGING_PATH}/${LOG_LEVEL}/${LOG_LEVEL}-%DATE%`,
    frequency: '1h',
    date_format: 'YYYY-MM-DD-HH',
    size: process.env.LOGGING_MAXSIZE,
    max_logs: process.env.LOGGING_MAXFILES,
    audit_file: `${process.env.LOGGING_PATH}/audit.json`,
    extension: '.log',
    create_symlink: true,
    symlink_name: 'tail-current.log',
  });

  return {
    logginConfig: {
      pinoHttp: {
        genReqId: function (req, res) {
          const uuid = v4();
          res.header('X-Request-Id', uuid);
          return uuid;
        },
        transport: LOG_LEVEL === 'debug'
        ? { target: 'pino-pretty' }
        : undefined,
        level: LOG_LEVEL, // 여기에도 있고, stream 상세에도 있어야 정상 동작 한다
        stream: pino.multistream([
          {
            stream: rotatingLogStream,
            level: LOG_LEVEL as Level,
          },
          {
            stream: process.stdout,
            level: process.env.LOGGING_CONSOLE_LEVEL as Level,
          },
        ]),
        formatters: {
          level(level) {
            return { level };
          },
        },
        redact: {
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
        // and all the other fields of:
        // - https://github.com/pinojs/pino-http#api
        // - https://github.com/pinojs/pino/blob/HEAD/docs/api.md#options-object
      },
      // logging 제외 URL 이하 처리 되어 있어서.. v1 하면 모든게 안나옴.. :(
      // exclude: [{ method: RequestMethod.GET, path: '/v1' }],
    },
  };
};
