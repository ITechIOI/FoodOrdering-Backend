import { Test, TestingModule } from '@nestjs/testing';
import { CacheWorkerController } from './cache_worker.controller';

describe('CacheWorkerController', () => {
  let controller: CacheWorkerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheWorkerController],
    }).compile();

    controller = module.get<CacheWorkerController>(CacheWorkerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
