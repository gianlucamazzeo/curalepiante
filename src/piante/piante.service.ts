import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PianteQueryDto } from './dto/piante-query.dto';
import {
  Pianta,
  PianteListaResponse,
  PerenualApiResponse,
} from './interfaces/pianta.interface';
import { IPiantaRepository } from './interfaces/pianta-repository.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PianteService {
  private readonly logger = new Logger(PianteService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('PIANTA_REPOSITORY')
    private readonly piantaRepository: IPiantaRepository,
    private readonly httpService: HttpService,
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

  async fetchPlantDetailsFromPerenual(
    id: number,
  ): Promise<PerenualApiResponse> {
    const apiKey = this.configService.get<string>('PERENUAL_API_KEY');
    if (!apiKey) {
      throw new Error('PERENUAL_API_KEY non configurata');
    }

    const url = `https://perenual.com/api/v2/species/details/${id}?key=${apiKey}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<PerenualApiResponse>(url),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Errore nel fetch da Perenual per ID ${id}:`, error);
      throw new Error(
        `Impossibile recuperare i dettagli della pianta da Perenual`,
      );
    }
  }

  private mapPerenualToOurSchema(
    perenualData: PerenualApiResponse,
  ): Partial<Pianta> {
    const mapped: Partial<Pianta> = {};

    if (perenualData.common_name) mapped.common_name = perenualData.common_name;
    if (perenualData.scientific_name)
      mapped.scientific_name = perenualData.scientific_name;
    if (perenualData.other_name) mapped.other_name = perenualData.other_name;
    if (perenualData.family) mapped.family = perenualData.family;
    if (perenualData.origin) mapped.origin = perenualData.origin;
    if (perenualData.type) mapped.type = perenualData.type;
    if (perenualData.cycle) mapped.cycle = perenualData.cycle;
    if (perenualData.watering) mapped.watering = perenualData.watering;
    if (perenualData.sunlight) mapped.sunlight = perenualData.sunlight;
    // Non sovrascrivere default_image durante l'enrichment per preservare il percorso locale
    if (perenualData.indoor !== undefined) mapped.indoor = perenualData.indoor;
    if (perenualData.flowers !== undefined)
      mapped.flowers = perenualData.flowers;
    if (perenualData.fruits !== undefined) mapped.fruits = perenualData.fruits;
    if (perenualData.cuisine !== undefined)
      mapped.cuisine = perenualData.cuisine;
    if (perenualData.medicinal !== undefined)
      mapped.medicinal = perenualData.medicinal;
    if (perenualData.poisonous_to_pets !== undefined)
      mapped.poisonous_to_pets = perenualData.poisonous_to_pets;
    if (perenualData.edible_fruit !== undefined)
      mapped.edible = perenualData.edible_fruit;
    if (perenualData.care_level) mapped.care_level = perenualData.care_level;
    if (perenualData.growth_rate) mapped.growth_rate = perenualData.growth_rate;
    if (perenualData.maintenance) mapped.maintenance = perenualData.maintenance;
    if (perenualData.drought_tolerant !== undefined)
      mapped.drought_tolerant = perenualData.drought_tolerant;
    if (perenualData.salt_tolerant !== undefined)
      mapped.salt_tolerant = perenualData.salt_tolerant;
    if (perenualData.tropical !== undefined)
      mapped.tropical = perenualData.tropical;
    if (perenualData.rare !== undefined) mapped.rare = perenualData.rare;
    if (perenualData.invasive !== undefined)
      mapped.invasive = perenualData.invasive;
    if (perenualData.thorny !== undefined) mapped.thorny = perenualData.thorny;
    if (perenualData.hardiness) mapped.hardiness = perenualData.hardiness;
    if (perenualData.pruning_month)
      mapped.pruning_month = perenualData.pruning_month;
    if (perenualData.flowering_season)
      mapped.flowering_season = perenualData.flowering_season;
    if (perenualData.fruiting_season)
      mapped.fruiting_season = perenualData.fruiting_season;
    if (perenualData.harvest_season)
      mapped.harvest_season = perenualData.harvest_season;
    if (perenualData.harvest_method)
      mapped.harvest_method = perenualData.harvest_method;
    if (perenualData.attracts) mapped.attracts = perenualData.attracts;
    if (perenualData.propagation) mapped.propagation = perenualData.propagation;
    if (perenualData.plant_anatomy)
      mapped.plant_anatomy = perenualData.plant_anatomy;
    if (perenualData.poisonous_to_humans !== undefined)
      mapped.poisonous_to_humans = perenualData.poisonous_to_humans;
    if (perenualData.description) mapped.description = perenualData.description;
    if (perenualData.xWateringQuality)
      mapped.xWateringQuality = perenualData.xWateringQuality;
    if (perenualData.xWateringAvgVolumeRequirement)
      mapped.xWateringAvgVolumeRequirement =
        perenualData.xWateringAvgVolumeRequirement;
    if (perenualData.xWateringDepthRequirement)
      mapped.xWateringDepthRequirement = perenualData.xWateringDepthRequirement;
    if (perenualData.xWateringBasedTemperature && typeof perenualData.xWateringBasedTemperature === 'object')
      mapped.xWateringBasedTemperature = perenualData.xWateringBasedTemperature;
    if (perenualData.xWateringPhLevel && typeof perenualData.xWateringPhLevel === 'object')
      mapped.xWateringPhLevel = perenualData.xWateringPhLevel;
    if (perenualData.xSunlightDuration && typeof perenualData.xSunlightDuration === 'object')
      mapped.xSunlightDuration = perenualData.xSunlightDuration;

    if (perenualData.dimensions) {
      mapped.dimensions = {
        min_height: perenualData.dimensions.min_value,
        max_height: perenualData.dimensions.max_value,
        height_unit: perenualData.dimensions.unit,
      };
    }

    if (perenualData.pruning_count) {
      mapped.pruning_count = `${perenualData.pruning_count.amount} ${perenualData.pruning_count.interval}`;
    }

    return mapped;
  }

  async enrichPlantWithPerenualData(
    plantId: number,
    perenualId: number,
  ): Promise<Pianta> {
    if (!this.piantaRepository.updatePianta) {
      throw new Error('Operazione non supportata dal repository corrente');
    }

    const perenualData = await this.fetchPlantDetailsFromPerenual(perenualId);
    const mappedData = this.mapPerenualToOurSchema(perenualData);

    return this.piantaRepository.updatePianta(plantId, mappedData);
  }
}
