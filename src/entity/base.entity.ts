import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;

    
    constructor(partial: Partial<BaseEntity>) {
        Object.assign(this, partial);
    }
}