import { Test, TestingModule } from '@nestjs/testing';
import { MapResolver } from './map.resolver';
import { MapService } from './map.service';

describe('MapResolver', () => {
  let resolver: MapResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapResolver, MapService],
    }).compile();

    resolver = module.get<MapResolver>(MapResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
