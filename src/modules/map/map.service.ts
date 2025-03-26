// src/modules/goong/goong.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MapService {
  private apiKey: string;
  private baseUrl = 'https://rsapi.goong.io';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('GOONG_MAP_API_KEY') || '';
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    const url = `${this.baseUrl}/Geocode`;
    const params = { latlng: `${lat},${lng}`, api_key: this.apiKey };
    const result = await lastValueFrom(this.httpService.get(url, { params }));
    return result.data;
  }

  async searchPlace(input: string): Promise<any> {
    const url = `${this.baseUrl}/Place/AutoComplete`;
    const params = { input, api_key: this.apiKey };
    const result = await lastValueFrom(this.httpService.get(url, { params }));
    return result.data;
  }

  async direction(from: string, to: string): Promise<any> {
    const url = `${this.baseUrl}/Direction`;
    const params = { origin: from, destination: to, api_key: this.apiKey };
    const result = await lastValueFrom(this.httpService.get(url, { params }));
    return result.data;
  }

  async getPlaceDetail(input: string): Promise<any> {
    const resTemp = await this.httpService.axiosRef.get(
      `https://rsapi.goong.io/Geocode?address=${input}&api_key=${this.apiKey}`,
    );
    return resTemp.data;
  }
}
