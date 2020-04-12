## od-backend

[![Docker](https://img.shields.io/docker/pulls/opendating/od-backend)](https://hub.docker.com/repository/docker/opendating/od-backend/tags)
![License](https://img.shields.io/github/license/open-dating/od-backend)
[![codecov](https://codecov.io/gh/open-dating/od-backend/branch/master/graph/badge.svg)](https://codecov.io/gh/open-dating/od-backend)
[![DeepScan grade](https://deepscan.io/api/teams/2754/projects/9569/branches/126329/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=2754&pid=9569&bid=126329)
![Github CI](https://github.com/open-dating/od-backend/workflows/Test,%20build,%20deploy/badge.svg?branch=master)

Open Dating is open source project like Tinder and others similar service, with lot of differents.

More info on project site: https://open-dating.org/

Available api endpoints: https://app.open-dating.org/api/v1/doc/

### Development
Install deps:

```bash
# install docker and docker compose
# docker - https://docs.docker.com/install/
# docker compose - https://docs.docker.com/compose/install/
# npm and nodejs - https://nodejs.org/en/
```

Init envs:

Create .env and copy all from .env.example

Run:

```bash
# install deps
npm i

# run docker with pg and dnn services
npm run docker:dev

# run migration and after it run nest app
npm run start:migrate-n-dev
```

Autogenerate new migration if you change enityties:
```bash
npm run typeorm:generate MigartionName
```

If you need fcm push functional, get fsm file form google and save in root as fcm.json

#### Seeding
When you first run, you can view in console admin login/pass as:
```
[Admin] Created admin user: {"email":"admin@localhost.loc","pass":"BCKUPE"}
```
You can use what cred for login via swagger: http://localhost:4300/api/v1/doc/
by auth/login method, after login get jwt.accessToken and autorize in swagger and now you can use all admin endpoints
which include seeding and etc.


### Test
Executed on localy instance
```bash
npm run test
```

Run in testing suite(with all migrations and etc):
```bash
# start testing containers
npm run docker:test

# run test
npm run docker:exec:test
```

### Production
Set up values in .env as .env.example-prod and run
```bash
docker volume create --name=od-postgres

docker-compose -f docker-compose.prod.yml up -d --build
```

## Roadmap
* [x] connect to sentry
* [x] calc dnn and distance is user profile
* [ ] add donation emails
* [x] edit more user profile fields
* [ ] check for lang typos
* [ ] add support more algo in users search
* [ ] write more tests
* [ ] add multilang support
* [ ] run on prod without docker-compose and .env files

