import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Req,
} from "@nestjs/common";

import { ZodValidationPipe } from "@utils/validation/zod-validation.pipe";

import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
} from "@nestjs/swagger";
import { JwtAuthenticatedRequest } from "@utils/types/auth-types";
import { ReviewsService } from "./reviews.service";
import { ReviewsType } from "@utils/types/reviews-types";
import { CreateReviewDto, createReviewSchema } from "./dto/create-review.dto";
import { UpdateReviewDto, updateReviewSchema } from "./dto/update-review.dto";
import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: ReviewsType })
  @UsePipes(new ZodValidationPipe(createReviewSchema))
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: JwtAuthenticatedRequest
  ) {
    return this.reviewsService.create(createReviewDto, req.user);
  }

  @ApiOkResponse({ type: ReviewsType, isArray: true })
  @Get("film/:filmId")
  findAllByFilm(@Param("filmId") filmId: string) {
    return this.reviewsService.findAllByFilm(filmId);
  }

  @ApiOkResponse({ type: ReviewsType, isArray: true })
  @Get("user/:userId")
  findAllByUser(@Param("userId") userId: string) {
    return this.reviewsService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  @ApiOkResponse({ type: ReviewsType })
  @UsePipes(new ZodValidationPipe(updateReviewSchema))
  update(
    @Param("id") id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req: JwtAuthenticatedRequest
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ReviewsType })
  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: JwtAuthenticatedRequest) {
    return this.reviewsService.remove(id, req.user);
  }
}
