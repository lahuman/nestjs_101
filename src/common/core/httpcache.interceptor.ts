import {
    CacheInterceptor,
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { CACHE_EVICT_METADATA, IGNORE_CACHE_METADATA } from './cache.decorator';

const CACHE_KEY_METADATA = 'cache_module:cache_key';
const CACHE_TTL_METADATA = 'cache_module:cache_ttl';

const isFunction = (val: any): boolean => typeof val === 'function';
const isUndefined = (obj: any): obj is undefined => typeof obj === 'undefined';
const isNil = (val: any): val is null | undefined => isUndefined(val) || val === null;

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {

    private readonly CACHE_EVICT_METHODS = [
        'POST', 'PATCH', 'PUT', 'DELETE'
    ];


    protected trackBy(context: ExecutionContext): string | undefined {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
        const cacheMetadata = this.reflector.get(
            CACHE_KEY_METADATA,
            context.getHandler(),
        );

        if (!isHttpApp || cacheMetadata) {
            return cacheMetadata;
        }

        const request = context.getArgByIndex(0);
        if (!this.isRequestCacheable(context)) {
            return undefined;
        }

        return `cache:${httpAdapter.getRequestUrl(request)}`;
    }

    protected isRequestCacheable(context: ExecutionContext): boolean {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const ignoreCaching = this.reflector.getAll(
            IGNORE_CACHE_METADATA,
            [
                context.getHandler(),
                context.getClass(),
            ]
        );

        return !ignoreCaching.find(f => f === true) && request.method === 'GET';
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<Request>();
        if (this.CACHE_EVICT_METHODS.includes(req.method)) {
            const reflector: Reflector = this.reflector;
            const evictKeys = reflector.getAllAndMerge(CACHE_EVICT_METADATA, [
                context.getClass(),
                context.getHandler(),
            ]);
            // 캐시 무효화 처리
            return next.handle().pipe(
                tap(() => {
                    if (evictKeys.length > 0) return this._clearCaches(evictKeys);
                    return this._clearCaches([req.originalUrl]);
                }),
            );
        }

        // // 기존 캐싱 처리
        // return super.intercept(context, next);

        const key = this.trackBy(context);
        // method TTL 에 우선순위를 둔다.
        const ttlValueOrFactory =
            this.reflector.getAll(CACHE_TTL_METADATA, [
                context.getHandler(),
                context.getClass(),
            ]).find(f => f) ?? null;

        if (!key) {
            return next.handle();
        }
        
        try {
            const value = await this.cacheManager.get(key);
            if (!isNil(value)) {
                return (value);
            }
            const ttl = isFunction(ttlValueOrFactory)
                ? await ttlValueOrFactory(context)
                : ttlValueOrFactory;
            return next.handle().pipe(
                tap(response => {
                    const args = isNil(ttl) ? [key, response] : [key, response, { ttl }];
                    this.cacheManager.set(...args);
                }),
            );
        } catch {
            return next.handle();
        }
    }

    /**
     * @param cacheKeys 삭제할 캐시 키 목록
     */
    private async _clearCaches(cacheKeys: string[]): Promise<boolean> {

        await Promise.all(cacheKeys.map(cacheKey => this.cacheManager.del(`cache:${cacheKey}`)));
        return true;
        
        // this.cacheManager.del("")
        // const client: Redis = await this.cacheManager.store.getClient();

        // const _keys = await Promise.all(
        //     cacheKeys.map((cacheKey) => client.keys(`cache:*${cacheKey}*`)),
        // );
        // const keys = _keys.flat();
        // const result2 = await Promise.all(keys.map((key) => !!this.cacheManager.del(key)));

        // return result2.flat().every((r) => !!r);
    }
}