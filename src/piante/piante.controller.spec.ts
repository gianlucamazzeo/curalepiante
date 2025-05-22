import { Test, TestingModule } from '@nestjs/testing';
import { PianteController } from './piante.controller';

describe('PianteController', () => {
  let controller: PianteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PianteController],
    }).compile();

    controller = module.get<PianteController>(PianteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
