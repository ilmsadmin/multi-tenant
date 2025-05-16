import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserData } from '../entities/user-data.entity';
import { CreateUserDataDto, UpdateUserDataDto, QueryUserDataDto } from '../dto/user-data.dto';

@Injectable()
export class UserDataService {
  constructor(
    @InjectRepository(UserData)
    private readonly userDataRepository: Repository<UserData>,
  ) {}

  async create(createUserDataDto: CreateUserDataDto): Promise<UserData> {
    const userData = this.userDataRepository.create(createUserDataDto);
    return this.userDataRepository.save(userData);
  }

  async findAll(query: QueryUserDataDto): Promise<UserData[]> {
    const queryBuilder = this.userDataRepository.createQueryBuilder('userData')
      .leftJoinAndSelect('userData.user', 'user');

    if (query.userId) {
      queryBuilder.andWhere('userData.userId = :userId', { userId: query.userId });
    }

    if (query.category) {
      queryBuilder.andWhere('userData.category = :category', { category: query.category });
    }

    if (query.key) {
      queryBuilder.andWhere('userData.key = :key', { key: query.key });
    }

    if (query.status) {
      queryBuilder.andWhere('userData.status = :status', { status: query.status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<UserData> {
    const userData = await this.userDataRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userData) {
      throw new NotFoundException(`Dữ liệu người dùng với ID ${id} không tồn tại`);
    }

    return userData;
  }

  async findByUserIdAndKey(userId: number, key: string): Promise<UserData> {
    const userData = await this.userDataRepository.findOne({
      where: { userId, key },
    });

    if (!userData) {
      throw new NotFoundException(`Dữ liệu với key ${key} không tồn tại cho người dùng ${userId}`);
    }

    return userData;
  }

  async findByUserIdAndCategory(userId: number, category: string): Promise<UserData[]> {
    return this.userDataRepository.find({
      where: { userId, category },
    });
  }

  async update(id: number, updateUserDataDto: UpdateUserDataDto): Promise<UserData> {
    const userData = await this.findOne(id);
    
    Object.assign(userData, updateUserDataDto);
    
    return this.userDataRepository.save(userData);
  }

  async remove(id: number): Promise<void> {
    const userData = await this.findOne(id);
    await this.userDataRepository.remove(userData);
  }
}
