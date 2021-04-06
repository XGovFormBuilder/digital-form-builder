import {
  Column,
  Entity,
  EntityRepository,
  PrimaryColumn,
  Repository,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { VersionedEntity } from "typeorm-versions";

@VersionedEntity()
@Entity({ name: "FORM" })
export class Form {
  @PrimaryColumn({
    type: "varchar",
    length: 256,
  })
  id!: string;

  @Column("varchar", { nullable: false, length: 256 })
  name!: string;

  @Column("boolean", { name: "feedback_form" })
  feedbackForm!: boolean;

  @Column("varchar", { name: "created_by", nullable: true, length: 256 })
  createdBy!: string;

  @Column("varchar", { name: "organization", nullable: true, length: 256 })
  organization!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column("varchar", { name: "modified_by", nullable: true, length: 256 })
  modifiedBy!: string;

  @UpdateDateColumn({ name: "last_modified_date" })
  modifiedAt!: Date;

  @Column({
    type: "jsonb",
    nullable: false,
    name: "form_json",
  })
  formJson!: string;
}

@EntityRepository(Form)
export class FormRepository extends Repository<Form> {}
