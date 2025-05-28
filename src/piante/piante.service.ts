import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PianteQueryDto } from './dto/piante-query.dto';
import { Pianta, PianteListaResponse } from './interfaces/pianta.interface';
import { IPiantaRepository } from './interfaces/pianta-repository.interface';

@Injectable()
export class PianteService {
  private readonly logger = new Logger(PianteService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('PIANTA_REPOSITORY')
    private readonly piantaRepository: IPiantaRepository,
  ) {}

  async getPiante(query: PianteQueryDto): Promise<PianteListaResponse> {
    return this.piantaRepository.getPiante(query);
  }

  async getPiantaById(id: number): Promise<Pianta> {
    return this.piantaRepository.getPiantaById(id);
  }

  async createPianta(piantaDto: Omit<Pianta, 'id'>): Promise<Pianta> {
    if (!this.piantaRepository.createPianta) {
      throw new Error('Operazione non supportata dal repository corrente');
    }

    const pianta: Omit<Pianta, 'id'> = {
      common_name: piantaDto.common_name,
      scientific_name: piantaDto.scientific_name,
      other_name: piantaDto.other_name || [],
      cycle: piantaDto.cycle,
      watering: piantaDto.watering,
      sunlight: piantaDto.sunlight,
      default_image: piantaDto.default_image || null,
      indoor: piantaDto.indoor,
      flowers: piantaDto.flowers,
      fruits: piantaDto.fruits,
      cuisine: piantaDto.cuisine,
      medicinal: piantaDto.medicinal,
      poisonous_to_pets: piantaDto.poisonous_to_pets,
      edible: piantaDto.edible,
      pruning_count: piantaDto.pruning_count,
    };

    return this.piantaRepository.createPianta(pianta);
  }

  async updatePianta(id: number, updates: Partial<Pianta>): Promise<Pianta> {
    if (!this.piantaRepository.updatePianta) {
      throw new Error('Operazione non supportata dal repository corrente');
    }
    return this.piantaRepository.updatePianta(id, updates);
  }

  async deletePianta(id: number): Promise<void> {
    if (!this.piantaRepository.deletePianta) {
      throw new Error('Operazione non supportata dal repository corrente');
    }
    return this.piantaRepository.deletePianta(id);
  }
}
