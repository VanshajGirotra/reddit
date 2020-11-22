import { EntityManager } from '@mikro-orm/postgresql';
import argon2 from 'argon2';
import { sendEmail } from '../utils/sendEmail';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { FORGOT_REDDIT_PREFIX, IDENTITY_COOKIE } from "../config";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { UserInput } from './UserInput';
import { v4 as uuidv4 } from 'uuid';
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
    @Arg('options') options: UserInput,
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

    if (options.email.indexOf('@') === -1) {
      return {
        errors: [
          {
            field: 'email',
            message: 'Enter correct email'
          }
        ]
      }
    }

    if (options.username.indexOf('@') !== -1) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Invalid username'
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
        email: options.email,
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
    req.session[IDENTITY_COOKIE] = user.id;


    return {
      user
    }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { em, redis }: MyContext,
    @Arg('username_email') username_email: string
  ) {
    const user = ~username_email.indexOf('@') ? await em.findOne(User, { email: username_email }) : await em.findOne(User, { username: username_email })

    if (!user)
      return true

    const token = uuidv4();
    await redis.set(FORGOT_REDDIT_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24) // 1 day expiry
    sendEmail(user.email, `<a href='http://localhost:3000/change-password/${token}'> Change Password </a>`)
    return true
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Ctx() { em, req, redis }: MyContext,
    @Arg('new_password') new_password: string,
    @Arg('token') token: string
  ): Promise<UserResponse> {

    if (new_password.length < 3) {
      return {
        errors: [{
          field: 'new_password',
          message: 'length of password cannot be less than 3'
        }]
      }
    }

    const redis_key = FORGOT_REDDIT_PREFIX + token;
    const user_id = await redis.get(redis_key)
    if (!user_id) {
      return {
        errors: [{
          field: 'token',
          message: 'token expired'
        }]
      }
    }

    const user = await em.findOne(User, { id: parseInt(user_id) })
    if (!user) {
      return {
        errors: [{
          field: 'token',
          message: 'token expired'
        }]
      }
    }
    user.password = await argon2.hash(new_password)
    await redis.del(redis_key)
    await em.persistAndFlush(user)
    req.session[IDENTITY_COOKIE] = user.id;
    return {
      user
    }
  }


  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext
  ): Promise<User | null> {

    const user = await em.findOne(User, { id: req.session[IDENTITY_COOKIE] })
    if (user) {
      return user
    }
    return null
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('username_email') username_email: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const login_field = ~username_email.indexOf('@') ? 'email' : 'username'
    const user_options = login_field === 'email' ? { email: username_email } : { username: username_email.toLowerCase() }
    const user = await em.findOne(User, user_options)
    if (!user) {
      return {
        errors: [{
          field: 'username_email',
          message: 'username or email doesn\'t exist'
        }]
      }
    }
    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [{
          field: "password",
          'message': 'incorrect password'
        }]
      }
    }

    req.session[IDENTITY_COOKIE] = user.id;

    return {
      user
    }
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ): Promise<Boolean> {
    return new Promise(resolve => {
      res.clearCookie(IDENTITY_COOKIE)
      req.session.destroy((error) => {
        if (error) {
          console.log("error in logout", error.message);
          resolve(false)
        }
        resolve(true)
      })
    })
  }
}