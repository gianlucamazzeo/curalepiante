import { PianteQueryDto } from '../dto/piante-query.dto';
import { Pianta, PianteListaResponse } from './pianta.interface';

export interface IPiantaRepository {
  getPiante(query: PianteQueryDto): Promise<PianteListaResponse>;
  getPiantaById(id: number): Promise<Pianta>;
  createPianta?(pianta: Omit<Pianta, 'id'>): Promise<Pianta>;
  updatePianta?(id: number, pianta: Partial<Pianta>): Promise<Pianta>;
  deletePianta?(id: number): Promise<void>;
}