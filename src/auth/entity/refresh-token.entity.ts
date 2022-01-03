import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity('refreshToken')
export class RefreshTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  idUser: number;

  @Column()
  expireAt: Date;

  @Column()
  revoked: boolean;
}
