import {Entity, model, property} from '@loopback/repository';

@model()
export class Salary extends Entity {
  @property({
    type: 'string',
  })
  employeeName?: string;

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'number',
  })
  bonus?: number;


  constructor(data?: Partial<Salary>) {
    super(data);
  }
}

export interface SalaryRelations {
  // describe navigational properties here
}

export type SalaryWithRelations = Salary & SalaryRelations;
