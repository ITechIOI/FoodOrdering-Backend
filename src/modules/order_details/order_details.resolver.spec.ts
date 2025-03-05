import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsResolver } from './order_details.resolver';
import { OrderDetailsService } from './order_details.service';

describe('OrderDetailsResolver', () => {
  let resolver: OrderDetailsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderDetailsResolver, OrderDetailsService],
    }).compile();

    resolver = module.get<OrderDetailsResolver>(OrderDetailsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
