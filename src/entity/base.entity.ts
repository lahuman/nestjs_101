import { Exclude } from "class-transformer";
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
    constructor(partial: Partial<BaseEntity>) {
        Object.assign(this, partial);
    }

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    @Exclude()
    deletedAt?: Date;
}