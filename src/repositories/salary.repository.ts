import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Salary, SalaryRelations} from '../models';

export class SalaryRepository extends DefaultCrudRepository<
  Salary,
  typeof Salary.prototype.id,
  SalaryRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
  ) {
    super(Salary, dataSource);
  }
}
