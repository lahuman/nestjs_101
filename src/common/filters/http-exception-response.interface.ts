export interface HttpExceptionResponse {
    statusCode: number;
    error: string;
}

export interface CustomHttpExecptionResponse extends HttpExceptionResponse {
    path: string;
    method: string;
    timeStamp: Date;
    request?: object;
}