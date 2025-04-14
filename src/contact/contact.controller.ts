// src/contact/contact.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity'; 
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('add')
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return await this.contactService.create(createContactDto);
  }

  @Get()
  async findAll(): Promise<Contact[]> {
    return await this.contactService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Contact | null> {
    return await this.contactService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contact | null> {
    return await this.contactService.update(+id, updateContactDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Contact | null> {
    return await this.contactService.remove(+id);
  }
}