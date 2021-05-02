import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Stock, StockRelations} from '../models';

export class StockRepository extends DefaultCrudRepository<
  Stock,
  typeof Stock.prototype.id,
  StockRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
  ) {
    super(Stock, dataSource);
  }
}
