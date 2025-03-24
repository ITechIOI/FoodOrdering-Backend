// src/modules/goong/goong.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { MapService } from './map.service';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class MapPrediction {
  @Field() description: string;
  @Field() place_id: string;
}

@ObjectType()
class GoongAutoCompleteResult {
  @Field(() => [MapPrediction]) predictions: MapPrediction[];
}

@ObjectType()
class GoongGeocodeResult {
  @Field() formatted_address: string;
  @Field() place_id: string;
}

@ObjectType()
class GoongDirectionResult {
  @Field() summary: string;
  @Field() distance: string;
  @Field() duration: string;
}

@Resolver()
export class MapResolver {
  constructor(private readonly goongService: MapService) {}

  @Query(() => GoongAutoCompleteResult)
  async searchPlace(@Args('input') input: string) {
    return this.goongService.searchPlace(input);
  }

  @Query(() => [GoongGeocodeResult])
  async reverseGeocode(@Args('lat') lat: number, @Args('lng') lng: number) {
    const res = await this.goongService.reverseGeocode(lat, lng);
    return res.results;
  }

  @Query(() => GoongDirectionResult)
  async direction(@Args('from') from: string, @Args('to') to: string) {
    const res = await this.goongService.direction(from, to);
    const route = res.routes[0];
    return {
      summary: route.summary,
      distance: route.legs[0].distance.text,
      duration: route.legs[0].duration.text,
    };
  }
}
