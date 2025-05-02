import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Utente, UtenteDocument } from '../../utenti/schemas/utente.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Utente.name) private utenteModel: Model<UtenteDocument>,
  ) {
    const secretKey = configService.get<string>('JWT_SECRET');
    if (!secretKey) {
      throw new Error("JWT_SECRET non è configurato nell'ambiente");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
    console.log(
      'JWT_SECRET configurato:',
      !!configService.get<string>('JWT_SECRET'),
    );
  }

  async validate(payload: { sub: string }) {
    // Il payload dovrebbe contenere l'id dell'utente
    const { sub: userId } = payload;

    // Cerca l'utente nel database
    const utente = await this.utenteModel.findById(userId).exec();

    // Se l'utente non esiste o non è attivo, nega l'accesso
    if (!utente || !utente.attivo) {
      throw new UnauthorizedException('Token non valido o utente non attivo');
    }

    // Ritorna l'utente che sarà disponibile nel request object (req.user)
    return utente;
  }
}
