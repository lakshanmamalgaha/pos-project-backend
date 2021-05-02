import {Entity, model, property} from '@loopback/repository';

@model()
export class Item extends Entity {
    @property({
        type: 'number',
        id: true,
        generated: true,
    })
    id?: number;

    @property({
        type: 'string',
        required: true,
    })
    name: string;

    @property({
        type: 'string',
    })
    description?: string;

    @property({
        type: 'number',
    })
    price?: number;

    constructor(data?: Partial<Item>) {
        super(data);
    }
}

export interface ItemRelations {
    // describe navigational properties here
}

export type ItemWithRelations = Item & ItemRelations;
