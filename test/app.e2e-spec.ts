import {Test, TestingModule} from '@nestjs/testing'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from './../src/app.module'
import * as regFormDtoFixture from '../fixtures/reg-form-dto.json'
import * as faker from 'faker'
import {join} from 'path'
import {AuthModule} from '../src/modules/auth/auth.module'
import {AuthService} from '../src/modules/auth/auth.service'
import {LoggedUserDto} from '../src/modules/auth/dto/logged-user-dto'
import {ImDialog} from '../src/modules/im/im-dialog.entity'
import {UserRole} from '../src/modules/user/enum/user-role.enum'
import {User} from '../src/modules/user/user.entity'
import {UserHabitPeriodicity} from '../src/modules/user/enum/user-habit-periodicity.enum'

describe('App (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let createdUser: LoggedUserDto
  let userToCreate: any
  let loggedUserData: LoggedUserDto
  let foundedUsers: any
  let matchedUser: LoggedUserDto
  let matchedDialog: ImDialog
  let anyUserId: number

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    authService = app.select(AuthModule).get(AuthService)

    await app.init()
  })

  afterAll((done) => {
    app.close()
    setTimeout(() => done)
  })

  it('create user', async () => {
    expect.assertions(5)

    const selfie = await request(app.getHttpServer())
      .post('/api/v1/photo/upload')
      .attach('file', join(__dirname, '..', 'fixtures/smile-2072907_1920.jpg'))
    expect(selfie.body).toHaveProperty('id')

    userToCreate = Object.assign(regFormDtoFixture, {
      pass: 'foobar',
      email: faker.internet.email(),
      firstname: faker.name.firstName(),
      selfieId: selfie.body.id,
      photosIds: [selfie.body.id],
    })
    const user = await request(app.getHttpServer())
      .post('/api/v1/auth/create-user')
      .send(userToCreate)
    expect(user.body).toHaveProperty('profile.id')
    expect(user.body).toHaveProperty('jwt.accessToken')
    expect(user.body).toHaveProperty('profile.unreadDialogs')
    expect(Array.isArray(user.body.profile.unreadDialogs)).toBeTruthy()

    createdUser = user.body.profile
  }, 30 * 1000)

  it('login created user', async () => {
    expect.assertions(2)

    const logged = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: userToCreate.email,
        pass: userToCreate.pass,
      })
    expect(logged.body).toHaveProperty('profile.id')
    expect(logged.body).toHaveProperty('jwt.accessToken')

    loggedUserData = logged.body
  })

  it('edit user profile', async () => {
    expect.assertions(3)

    await request(app.getHttpServer())
      .patch('/api/v1/user/my-profile')
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send({
        photosIds: loggedUserData.profile.photos.map(p => p.id),
        weight: 100,
        bio: 'foo bar',
      })

    const res = await request(app.getHttpServer())
      .get('/api/v1/user/my-profile')
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)

    const profile: User = res.body

    expect(profile).toHaveProperty('weight')
    expect(profile.weight).toBe(100)
    expect(profile.bio).toBe('foo bar')
  })

  it('edit user profile habits', async () => {
    expect.assertions(3)

    await request(app.getHttpServer())
      .patch('/api/v1/user/my-profile')
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send({
        photosIds: loggedUserData.profile.photos.map(p => p.id),
        weight: 100,
        bio: '',
        habits: {
          concert: UserHabitPeriodicity.Many,
          cinema: UserHabitPeriodicity.One,
        },
      })

    const resWithHabits = await request(app.getHttpServer())
      .get('/api/v1/user/my-profile')
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)

    const profileWithHabits: User = resWithHabits.body
    expect(profileWithHabits).toHaveProperty('habits')

    expect(profileWithHabits.habits.concert).toBe(UserHabitPeriodicity.Many)
    expect(profileWithHabits.habits.cinema).toBe(UserHabitPeriodicity.One)
  })

  it('seed users, check role acces', async () => {
    expect.assertions(1)

    const test = await request(app.getHttpServer())
      .post('/api/v1/admin/seed')
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send({
        count: 2,
        pass: 'foobar',
        location: regFormDtoFixture.location,
        gender: loggedUserData.profile.setting.searchGender,
        useType: loggedUserData.profile.useType,
        createDialogs: false,
      })
    expect(test.status).toBe(403)
  })

  it('seed users', async () => {
    expect.assertions(4)

    const items = await request(app.getHttpServer())
      .post('/api/v1/admin/seed')
      .set('Authorization', `Bearer ${authService.getTokenByPayload({
        id: 1,
        role: UserRole.Admin,
        email: 'a@a.com',
      })}`)
      .send({
        count: 2,
        pass: 'foobar',
        location: regFormDtoFixture.location,
        gender: loggedUserData.profile.setting.searchGender,
        useType: loggedUserData.profile.useType,
        createDialogs: false,
      })
    expect(items.body).toHaveProperty('users')
    expect(items.body).toHaveProperty('dialogs')

    expect(items.body.dialogs).toHaveLength(0)
    expect(items.body.users[0]).toHaveProperty('id')

  }, 30 * 1000)

  it('users search', async () => {
    expect.assertions(5)

    const items = await request(app.getHttpServer())
      .get('/api/v1/user/search-near')
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    expect(items.body).toHaveProperty('data')
    expect(items.body.data[0]).toHaveProperty('id')
    expect(items.body.data.length).toBeGreaterThan(1)

    // check for user data leak
    expect(items.body.data[0]).not.toHaveProperty('email')
    expect(items.body.data[0]).not.toHaveProperty('selfie')

    anyUserId = items.body.data[0].id
    foundedUsers = items.body.data
  })

  it('view any user profile', async () => {
    expect.assertions(3)

    const resp = await request(app.getHttpServer())
      .get(`/api/v1/user/profile/${anyUserId}`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()

    const user: User = resp.body

    // check for data leak
    expect(user).not.toHaveProperty('email')

    expect(user.locationDistance > 0).toBeTruthy()
    expect(user.cubeDistance > 0).toBeTruthy()
  })

  it('actions: pass, like, match', async () => {
    expect.assertions(5)

    const [pass, like] = foundedUsers
    matchedUser = authService.login(like)

    // pass
    const passRes = await request(app.getHttpServer())
      .post(`/api/v1/choice/pass/${pass.id}`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    expect(passRes.body).toHaveProperty('id')

    // at first set like from other
    const likeRes = await request(app.getHttpServer())
      .post(`/api/v1/choice/like/${loggedUserData.profile.id}`)
      .set('Authorization', `Bearer ${matchedUser.jwt.accessToken}`)
      .send()
    expect(likeRes.body).toHaveProperty('dialog')

    // anw match now
    const match = await request(app.getHttpServer())
      .post(`/api/v1/choice/like/${matchedUser.profile.id}`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    expect(match.body).toHaveProperty('dialog.id')
    matchedDialog = match.body.dialog
    // console.log(matchedUser.profile.id, loggedUserData.jwt.accessToken)

    // check for double like
    const matchDuplicate = await request(app.getHttpServer())
      .post(`/api/v1/choice/like/${matchedUser.profile.id}`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    expect(matchDuplicate.body).toHaveProperty('dialog.id')
    expect(matchDuplicate.body.dialog.id).toBe(matchedDialog.id)

  })

  it('list of dialogs', async () => {
    expect.assertions(6)

    const items = await request(app.getHttpServer())
      .get(`/api/v1/im/dialogs/${loggedUserData.profile.id}`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    expect(items.body).toHaveProperty('data')
    expect(items.body.data[0]).toHaveProperty('id')
    expect(items.body.data[0]).toHaveProperty('users')
    expect(items.body.data[0].users[0]).toHaveProperty('photos')

    // check for user data leak
    expect(items.body.data[0].users[0]).not.toHaveProperty('email')
    expect(items.body.data[0].users[0]).not.toHaveProperty('selfie')
  })

  it('im send message, and sended message exist in messages list', async () => {
    expect.assertions(4)

    const messageText = 'Hi! How are you?'
    const items = await request(app.getHttpServer())
      .post(`/api/v1/im/send-message`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send({
        dialogId: matchedDialog.id,
        text: messageText,
      })
    expect(items.body).toHaveProperty('id')

    const messages = await request(app.getHttpServer())
      .get(`/api/v1/im/dialog/${matchedDialog.id}/messages`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    expect(messages.body).toHaveProperty('data')
    expect(messages.body.data[0]).toHaveProperty('id')

    const lastMsg = messages.body.data[messages.body.data.length - 1]
    expect(lastMsg.text).toContain(messageText)
  })

  it('send complaint', async () => {
    expect.assertions(2)

    const comp = await request(app.getHttpServer())
      .post(`/api/v1/complaint/create`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send({
        toUserId: matchedDialog.users[0].id,
        text: '',
        dialogId: 0,
        location: '',
      })
    expect(comp.body).toHaveProperty('id')
    expect(comp.body).toHaveProperty('text')
  })

  it('remove user', async () => {
    expect.assertions(4)

    // get dialogs list for use in early
    const r = await request(app.getHttpServer())
      .get(`/api/v1/im/dialogs/${loggedUserData.profile.id}?limit=1000`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()
    const dialogs: ImDialog[] = r.body.data

    // remove
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/system/user/${loggedUserData.profile.id}`)
      .set('Authorization', `Bearer ${loggedUserData.jwt.accessToken}`)
      .send()

    expect(res.status).toBe(200)

    // check cant auth
    const authRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: userToCreate.email,
        pass: userToCreate.pass,
      })
    expect(authRes.body).not.toHaveProperty('profile.id')
    expect(authRes.body).not.toHaveProperty('jwt.accessToken')

    // check removed user not exist in dialog list on other user
    const firstDialog = dialogs[0]
    const otherUser = firstDialog.users.find(u => u.id !== loggedUserData.profile.id)

    const otherUserDialogsResp = await request(app.getHttpServer())
      .get(`/api/v1/im/dialogs/${otherUser.id}?limit=1000`)
      .set('Authorization', `Bearer ${authService.getTokenByPayload({
        id: otherUser.id,
        email: 'a@a.com',
        role: UserRole.User,
      })}`)
      .send()
    const otherUserDialogs: ImDialog[] = otherUserDialogsResp.body.data

    let foundDialog = false
    for (const d of otherUserDialogs) {
      if (d.id === firstDialog.id) {
        foundDialog = true
      }
    }

    expect(foundDialog).toBeFalsy()
  })
})
