import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MapService } from './map.service';
import { Map } from './entities/map.entity';
import { CreateMapInput } from './dto/create-map.input';
import { UpdateMapInput } from './dto/update-map.input';

@Resolver(() => Map)
export class MapResolver {
  constructor(private readonly mapService: MapService) {}

  @Mutation(() => Map)
  createMap(@Args('createMapInput') createMapInput: CreateMapInput) {
    return this.mapService.create(createMapInput);
  }

  @Query(() => [Map], { name: 'map' })
  findAll() {
    return this.mapService.findAll();
  }

  @Query(() => Map, { name: 'map' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.mapService.findOne(id);
  }

  @Mutation(() => Map)
  updateMap(@Args('updateMapInput') updateMapInput: UpdateMapInput) {
    return this.mapService.update(updateMapInput.id, updateMapInput);
  }

  @Mutation(() => Map)
  removeMap(@Args('id', { type: () => Int }) id: number) {
    return this.mapService.remove(id);
  }
}
