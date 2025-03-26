// src/modules/goong/goong.resolver.ts
import { Resolver, Query, Args, Float } from '@nestjs/graphql';
import { MapService } from './map.service';
import { ObjectType, Field } from '@nestjs/graphql';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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
class PlaceDetails {
  @Field() longitude: string;
  @Field() latitude: string;
  @Field() placeId: string;
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

  // Phương thức để tìm kiếm danh sách các địa điểm theo tên
  @Query(() => GoongAutoCompleteResult)
  async searchPlace(@Args('input') input: string) {
    return this.goongService.searchPlace(input);
  }

  // Phương thức này để tìm kiếm địa chỉ dựa vào tọa độ
  @Query(() => [GoongGeocodeResult])
  async reverseGeocode(
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
  ) {
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

  // Phương thức để lấy đươc tọa độ của một vị trí
  @Query(() => PlaceDetails)
  async searchAddress(@Args('input') input: string): Promise<PlaceDetails> {
    const autoCompleteResult = await this.goongService.getPlaceDetail(input);
    if (!autoCompleteResult.results.length) {
      throw new NotFoundException('Cannot find this place');
    }
    const prediction = autoCompleteResult.results[0];
    const location = prediction.geometry.location;
    return {
      longitude: location.lng.toString(),
      latitude: location.lat.toString(),
      placeId: prediction.place_id,
    };
  }
}
