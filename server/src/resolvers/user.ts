import { Resolver, Mutation, Arg, Field, InputType, Ctx, ObjectType } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
@InputType()
class UserNamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserNamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {

    if (options.username.length < 3) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length of username cannot be less than 3'
          }
        ]
      }
    }

    if (options.password.length < 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length of password cannot be less than 3'
          }
        ]
      }
    }

    const hashed_password = await argon2.hash(options.password)
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
        username: options.username,
        password: hashed_password,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      user = result[0]

    } catch (err) {

      if (err.code === '23505') {  // duplicate username
        return {
          errors: [{
            field: 'username',
            message: 'username already exists'
          }]
        }
      } else {
        console.log("error", err);
        return {
          errors: [{
            field: 'unknown',
            message: 'something went wrong'
          }]
        }
      }
    }

    // login cookie
    req.session.userId = user.id;


    return {
      user
    }
  }

  @Mutation(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext
  ): Promise<User | null> {

    const user = await em.findOne(User, { id: req.session.userId })
    if (user) {
      return user
    }
    return null
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UserNamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username.toLowerCase() })
    if (!user) {
      return {
        errors: [{
          field: "username",
          message: "username doesn't exist"
        }]
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [{
          field: "password",
          'message': 'incorrect password'
        }]
      }
    }

    req.session.userId = user.id;

    return {
      user
    }
  }

}