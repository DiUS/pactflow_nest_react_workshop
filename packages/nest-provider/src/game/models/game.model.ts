import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Review {
  @Field({ nullable: true }) 
  rating: number;

  @Field({ nullable: true }) 
  comment: string;
}

@ObjectType()
export class Game {
  @Field() 
  id: number;

  @Field() 
  name: string;

  @Field() 
  type: string;

  @Field()
  url: string;

  @Field(() => [Review]) 
  reviews: Review[];
}
