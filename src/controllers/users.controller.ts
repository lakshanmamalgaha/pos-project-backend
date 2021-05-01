// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate, TokenService, UserService,} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Filter, model, property, repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param, post, put, requestBody} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {Credentials, UserRepository} from '../repositories';
import {basicAuthorization, PasswordHasher, validateCredentials} from '../services';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {CredentialsRequestBody, UserProfileSchema,} from './specs/user-controller.specs';
import {User} from "../models";


@model()
export class NewUserRequest extends User {
    @property({
        type: 'string',
        required: true,
    })
    password: string;
}


export class UserController {
    constructor(
        @repository(UserRepository) public userRepository: UserRepository,
        @inject(PasswordHasherBindings.PASSWORD_HASHER)
        public passwordHasher: PasswordHasher,
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: TokenService,
        @inject(UserServiceBindings.USER_SERVICE)
        public userService: UserService<User, Credentials>,
    ) {
    }

    @post('/users', {
        responses: {
            '200': {
                description: 'User',
                content: {
                    'application/json': {
                        schema: {
                            'x-ts-type': User,
                        },
                    },
                },
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(NewUserRequest, {
                        title: 'NewUser',
                        exclude: ['id', "createDate"]
                    }),
                },
            },
        })
            newUserRequest: NewUserRequest,
    ): Promise<User> {
        // All new users have the "customer" role by default
        newUserRequest.roles = ['customer'];
        //user registered date;
        newUserRequest.createDate = new Date().toISOString();
        // ensure a valid email value and password value
        validateCredentials(_.pick(newUserRequest, ['email', 'password']));

        // encrypt the password
        const password = await this.passwordHasher.hashPassword(
            newUserRequest.password,
        );

        try {
            // create the new user
            const savedUser = await this.userRepository.create(
                _.omit(newUserRequest, 'password'),
            );

            // set the password
            await this.userRepository
                .userCredentials(savedUser.id)
                .create({password});

            return savedUser;
        } catch (error) {
            // MongoError 11000 duplicate key
            if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
                throw new HttpErrors.Conflict('Email value is already taken');
            } else {
                throw error;
            }
        }
    }

    @put('/users/{userId}', {
        security: OPERATION_SECURITY_SPEC,
        responses: {
            '200': {
                description: 'User',
                content: {
                    'application/json': {
                        schema: {
                            'x-ts-type': User,
                        },
                    },
                },
            },
        },
    })
    @authenticate('jwt')
    @authorize({
        allowedRoles: ['admin', 'customer'],
        voters: [basicAuthorization],
    })
    async set(
        @inject(SecurityBindings.USER)
            currentUserProfile: UserProfile,
        @param.path.string('userId') userId: number,
        @requestBody({description: 'update user'}) user: User,
    ): Promise<void> {
        try {
            // Only admin can assign roles
            if (!currentUserProfile.roles.includes('admin')) {
                delete user.roles;
            }
            return await this.userRepository.updateById(userId, user);
        } catch (e) {
            return e;
        }
    }

    @get('/users/{userId}', {
        security: OPERATION_SECURITY_SPEC,
        responses: {
            '200': {
                description: 'User',
                content: {
                    'application/json': {
                        schema: {
                            'x-ts-type': User,
                        },
                    },
                },
            },
        },
    })
    @authenticate('jwt')
    @authorize({
        allowedRoles: ['admin', 'support', 'customer'],
        voters: [basicAuthorization],
    })
    async findById(@param.path.string('userId') userId: number): Promise<User> {
        return this.userRepository.findById(userId);
    }

    @get('/users', {
        security: OPERATION_SECURITY_SPEC,
        responses: {
            '200': {
                description: 'The current user profile',
                content: {
                    'application/json': {
                        schema: UserProfileSchema,
                    },
                },
            },
        },
    })
    @authenticate('jwt')
    @authorize({
        allowedRoles: ['admin'],
        voters: [basicAuthorization],
    })
    async find(@param.filter(User) filter?: Filter<User>,): Promise<User[]> {
        return this.userRepository.find(filter);
    }

    @get('/users/me', {
        security: OPERATION_SECURITY_SPEC,
        responses: {
            '200': {
                description: 'The current user profile',
                content: {
                    'application/json': {
                        schema: UserProfileSchema,
                    },
                },
            },
        },
    })
    @authenticate('jwt')
    async printCurrentUser(
        @inject(SecurityBindings.USER)
            currentUserProfile: UserProfile,
    ): Promise<User> {
        // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
        // for symbol property

        const userId = +currentUserProfile[securityId];
        return this.userRepository.findById(userId);
    }

    @post('/users/login', {
        responses: {
            '200': {
                description: 'Token',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async login(
        @requestBody(CredentialsRequestBody) credentials: Credentials,
    ): Promise<{ token: string }> {
        // ensure the user exists, and the password is correct
        const user = await this.userService.verifyCredentials(credentials);

        // convert a User object into a UserProfile object (reduced set of properties)
        const userProfile = this.userService.convertToUserProfile(user);

        // create a JSON Web Token based on the user profile
        const token = await this.jwtService.generateToken(userProfile);

        return {token};
    }

}


