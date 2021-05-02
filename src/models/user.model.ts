// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property, hasOne} from '@loopback/repository';
import {UserCredentials} from './user-credentials.model';

@model({
    settings: {
        indexes: {
            uniqueEmail: {
                keys: {
                    email: 1,
                },
                options: {
                    unique: true,
                },
            },
        },
    },
})
export class User extends Entity {
    @property({
        type: 'number',
        generated: true,
        id: true,
    })
    id: number;

    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
    })
    firstName?: string;

    @property({
        type: 'string',
    })
    lastName?: string;

    @property({
        type: 'array',
        itemType: 'string',
    })
    roles?: string[];

    @property({
        type: 'date',
        required: true,
    })
    createDate: string;

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

    constructor(data?: Partial<User>) {
        super(data);
    }
}
