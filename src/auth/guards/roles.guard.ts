import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ottieni i ruoli richiesti dal decoratore @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se non ci sono ruoli richiesti, consenti l'accesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Ottieni l'utente dalla request (aggiunto dal JwtAuthGuard)
    const { user }: { user: { ruolo: string } } = context
      .switchToHttp()
      .getRequest();

    // Verifica se l'utente ha uno dei ruoli richiesti
    const hasRequiredRole = requiredRoles.some((role) => user.ruolo === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Permesso negato: richiesto uno dei seguenti ruoli [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
