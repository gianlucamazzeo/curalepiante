import { Test, TestingModule } from '@nestjs/testing';
import { PianteService } from './piante.service';

describe('PianteService', () => {
  let service: PianteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PianteService],
    }).compile();

    service = module.get<PianteService>(PianteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
