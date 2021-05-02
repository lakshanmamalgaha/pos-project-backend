import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Salary} from '../models';
import {SalaryRepository} from '../repositories';

export class SalaryController {
  constructor(
    @repository(SalaryRepository)
    public salaryRepository : SalaryRepository,
  ) {}

  @post('/salary')
  @response(200, {
    description: 'Salary model instance',
    content: {'application/json': {schema: getModelSchemaRef(Salary)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Salary, {
            title: 'NewSalary',
            exclude: ['id'],
          }),
        },
      },
    })
    salary: Omit<Salary, 'id'>,
  ): Promise<Salary> {
    return this.salaryRepository.create(salary);
  }

  @get('/salary/count')
  @response(200, {
    description: 'Salary model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Salary) where?: Where<Salary>,
  ): Promise<Count> {
    return this.salaryRepository.count(where);
  }

  @get('/salary')
  @response(200, {
    description: 'Array of Salary model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Salary, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Salary) filter?: Filter<Salary>,
  ): Promise<Salary[]> {
    return this.salaryRepository.find(filter);
  }

  @patch('/salary')
  @response(200, {
    description: 'Salary PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Salary, {partial: true}),
        },
      },
    })
    salary: Salary,
    @param.where(Salary) where?: Where<Salary>,
  ): Promise<Count> {
    return this.salaryRepository.updateAll(salary, where);
  }

  @get('/salary/{id}')
  @response(200, {
    description: 'Salary model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Salary, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Salary, {exclude: 'where'}) filter?: FilterExcludingWhere<Salary>
  ): Promise<Salary> {
    return this.salaryRepository.findById(id, filter);
  }

  @patch('/salary/{id}')
  @response(204, {
    description: 'Salary PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Salary, {partial: true}),
        },
      },
    })
    salary: Salary,
  ): Promise<void> {
    await this.salaryRepository.updateById(id, salary);
  }

  @put('/salary/{id}')
  @response(204, {
    description: 'Salary PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() salary: Salary,
  ): Promise<void> {
    await this.salaryRepository.replaceById(id, salary);
  }

  @del('/salary/{id}')
  @response(204, {
    description: 'Salary DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.salaryRepository.deleteById(id);
  }
}
