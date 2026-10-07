import { Column, Entity, PrimaryColumn } from 'typeorm';

// Tokens JWT invalidados por logout. Se identifican por su jti.
@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryColumn()
  jti: string;

  // Cuándo expira el token original; pasada esa fecha la fila ya no hace falta
  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
