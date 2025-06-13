import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AffiliateProductsService } from './affiliate-products.service';
import { CreateAffiliateProductDto, UpdateAffiliateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('affiliate-products')
export class AffiliateProductsController {
  constructor(private readonly affiliateProductsService: AffiliateProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createAffiliateProductDto: CreateAffiliateProductDto) {
    return this.affiliateProductsService.create(createAffiliateProductDto);
  }

  @Get()
  findAll() {
    return this.affiliateProductsService.findAll();
  }

  @Get('plant/:plantId')
  findByPlantId(@Param('plantId') plantId: string) {
    return this.affiliateProductsService.findByPlantId(plantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affiliateProductsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateAffiliateProductDto: UpdateAffiliateProductDto) {
    return this.affiliateProductsService.update(id, updateAffiliateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.affiliateProductsService.remove(id);
  }

  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  incrementClicks(@Param('id') id: string) {
    return this.affiliateProductsService.incrementClicks(id);
  }

  @Post(':id/conversion')
  @HttpCode(HttpStatus.OK)
  incrementConversions(@Param('id') id: string, @Body('revenue') revenue?: number) {
    return this.affiliateProductsService.incrementConversions(id, revenue);
  }
}