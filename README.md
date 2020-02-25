## od-backend

### Development
Install deps

```bash
# install docker and docker compose
# docker - https://docs.docker.com/install/
# docker compose - https://docs.docker.com/compose/install/
```

Run

```bash
docker volume create --name=od-postgres

# development, in watch mode
docker-compose -f docker-compose.dev.yml up
```

### Test

```bash
docker exec od-backend-node npm run test
```

### Production
Set up values in .env as .env.example and run
```
docker volume create --name=od-postgres

docker-compose -f docker-compose.prod.yml up -d --build
```

## Roadmap

* [ ] calc dnn and distance is user profile
* [ ] add donation emails
* [x] edit more user profile fields
* [ ] check for lang typos
* [ ] add support more algo in users search
* [ ] write more tests
* [ ] add multilang support
