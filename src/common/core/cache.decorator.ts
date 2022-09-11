import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const CACHE_EVICT_METADATA = 'cache:CACHE_EVICT';

export const IGNORE_CACHE_METADATA = 'cache:IGNORE_CACHE';

export const NoCache = () => SetMetadata(IGNORE_CACHE_METADATA, true);

export const CacheEvict = (
  ...cacheEvictKeys: string[]
): CustomDecorator<string> => SetMetadata(CACHE_EVICT_METADATA, cacheEvictKeys);