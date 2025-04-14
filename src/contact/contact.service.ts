// src/contact/contact.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity'; 

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find();
  }

  async findOne(id: number): Promise<Contact | null> {
    return await this.contactRepository.findOneBy({ id });
  }

  async update(id: number, updateContactDto: UpdateContactDto): Promise<Contact | null> {
    const contact = await this.contactRepository.preload({
      id: id,
      ...updateContactDto,
    });
    if (!contact) return null;
    return await this.contactRepository.save(contact);
  }

  async remove(id: number): Promise<Contact | null> {
    const contact = await this.findOne(id);
    if (!contact) return null;
    return await this.contactRepository.remove(contact);
  }
}