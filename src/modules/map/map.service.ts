import { Injectable } from '@nestjs/common';
import { CreateMapInput } from './dto/create-map.input';
import { UpdateMapInput } from './dto/update-map.input';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Use Goong Map API

@Injectable()
export class MapService {
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOONG_MAPS_API_KEY') || '';
  }

  // Chuyển địa chỉ thành tọa độ
  async getGeolocation(address: string): Promise<any> {
    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  // Tính khoảng cách giữa hai điểm
  async getDistance(origin: string, destination: string): Promise<any> {
    const url = `https://rsapi.goong.io/DistanceMatrix?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&vehicle=bike&api_key=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  create(createMapInput: CreateMapInput) {
    return 'This action adds a new map';
  }

  findAll() {
    return `This action returns all map`;
  }

  findOne(id: number) {
    return `This action returns a #${id} map`;
  }

  update(id: number, updateMapInput: UpdateMapInput) {
    return `This action updates a #${id} map`;
  }

  remove(id: number) {
    return `This action removes a #${id} map`;
  }
}
