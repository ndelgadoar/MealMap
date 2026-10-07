import { Role } from '../../users/enums/role.enum.js';

// Contenido firmado dentro del JWT
export interface JwtPayload {
  sub: string; // id del usuario
  email: string;
  role: Role;
  jti: string; // id único del token (para poder revocarlo)
  exp: number; // expiración, en segundos desde epoch
}

// Lo que queda disponible en request.user tras validar el token
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  jti: string;
  exp: number;
}
