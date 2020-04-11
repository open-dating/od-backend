import * as path from 'path'
import * as pkg from '../../package.json'

const rootPath = String(process.env.ROOT_PATH || path.join(__dirname, '/../../'))

export const appConfig = {
  port: Number(process.env.PORT || 4300),
  jwtSecret: String(process.env.JWT_SECRET),
  jwtSignOptions: {expiresIn: '365d'},
  passHashSalt: String(process.env.PASS_HASH_SALT),
  dnnFaceUrl: String(process.env.DNN_FACE_URL),
  dnnNSFWUrl: String(process.env.DNN_NSFW_URL),
  NSFWTreshold: Number(process.env.NSFW_TRESHOLD || 0.12),
  host: String(process.env.HOST || 'http://localhost:4300'),
  domain: String(process.env.DOMAIN || 'localhost.loc'),
  rootPath,
  fcmFilePath: path.join(rootPath, 'fcm.json'),
  image: {
    w: 1200,
    h: 1200,
    quality: 70,
  },
  smtp: {
    robotEmail: process.env.SMTP__ROBOT_EMAIL || 'jayce.kirlin25@ethereal.email',
    host: process.env.SMTP__HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP__HOST || 587),
    secure: Boolean(process.env.SMTP__SECURE || false),
    auth: {
      user: process.env.SMTP__USER || 'jayce.kirlin25@ethereal.email',
      pass: process.env.SMTP__PASS || 'YxRsGBUGHjUtepkBQ2',
    },
  },
  sentry: {
    dsn: String(process.env.SENTRY__DSN || 'https://DUMMY@sentry.io/3271268'),
    release: pkg.version,
  },
  isProd: Boolean(process.env.NODE_ENV === 'production'),
  isDev: Boolean(process.env.NODE_ENV === 'development'),
}
