import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UtenteDocument } from '../utenti/schemas/utente.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel('Utente') private utenteModel: Model<UtenteDocument>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    return this.validateUser(loginDto.email, loginDto.password);
  }

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.debug(`Tentativo di autenticazione per l'utente: ${email}`);

    const user = await this.utenteModel.findOne({ email }).exec();

    if (!user) {
      this.logger.warn(`Autenticazione fallita: utente ${email} non trovato`);
      throw new UnauthorizedException('Credenziali non valide');
    }

    // comparePassword è un metodo definito nello schema utente
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Autenticazione fallita: password non valida per ${email}`,
      );
      throw new UnauthorizedException('Credenziali non valide');
    }

    // Verifica se l'utente è attivo
    if (!user.attivo) {
      this.logger.warn(`Autenticazione fallita: utente ${email} non attivo`);
      throw new UnauthorizedException('Account utente disattivato');
    }

    // Aggiorna ultimo accesso
    user.ultimoAccesso = new Date();
    await user.save();

    this.logger.log(`Utente ${email} autenticato con successo`);

    // Crea il payload del token JWT
    const payload = {
      sub: user._id,
      email: user.email,
      ruolo: user.ruolo,
    };

    // Genera il token JWT
    const token = this.jwtService.sign(payload);

    // Utilizziamo la destrutturazione per escludere le proprietà sensibili
    const { ...userObject } = user.toObject();

    // Risposta formattata secondo lo standard dell'applicazione
    return {
      success: true,
      data: {
        user: userObject,
        token,
      },
      message: 'Login effettuato con successo',
      timestamp: new Date().toISOString(),
      statusCode: 200,
    };
  }

  /**
   * Verifica un token JWT e restituisce i dati dell'utente associato
   * Questa funzione è utile per implementare endpoint protetti
   */
  async verifyToken(userId: string): Promise<any> {
    this.logger.debug(`Verifica utente con ID: ${userId}`);

    const user = await this.utenteModel.findById(userId).exec();

    if (!user) {
      this.logger.warn(`Verifica fallita: utente con ID ${userId} non trovato`);
      throw new UnauthorizedException('Token non valido');
    }

    if (!user.attivo) {
      this.logger.warn(`Verifica fallita: utente con ID ${userId} non attivo`);
      throw new UnauthorizedException('Account utente disattivato');
    }

    // Utilizziamo la destrutturazione per escludere le proprietà sensibili
    const userObject = user.toObject();

    return userObject;
  }

  logout(userId: string): Promise<boolean> {
    this.logger.debug(`Logout per utente ID: ${userId}`);

    return Promise.resolve(true);
  }
}
