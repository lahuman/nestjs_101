import { Logger as nestLogger } from "@nestjs/common";
import { Logger, QueryRunner } from "typeorm"

export class QueryLogger implements Logger {
    private logger = new nestLogger("QueryLogger");

    stringifyParams = function (parameters) {
        try {
            return JSON.stringify(parameters);
        }
        catch (error) { // most probably circular objects in parameters
            return parameters;
        }
    };

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        var sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");

        this.logger.debug("query" + ": " + sql);
    }
    logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        var sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");

        this.logger.debug("query failed: " + sql);
        this.logger.debug("error:", error);
        this.logger.error({ error, sql });
    }
    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        var sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
        this.logger.log({ time, sql });
    }
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {

        this.logger.debug(message);
    }
    logMigration(message: string, queryRunner?: QueryRunner) {

        this.logger.debug(message);
    }
    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner) {

        this.logger.debug(message);
    }
    // implement all methods from logger class
}