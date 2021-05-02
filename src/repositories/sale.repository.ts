import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Sale, SaleRelations} from '../models';

export class SaleRepository extends DefaultCrudRepository<
  Sale,
  typeof Sale.prototype.id,
  SaleRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
  ) {
    super(Sale, dataSource);
  }
}
