.PHONY: install dev build start db-seed db-reset db-studio docker-up docker-down

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm start

db-seed:
	npx prisma db seed

db-reset:
	npx prisma migrate reset --force

db-studio:
	npx prisma studio

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose up -d --build

lint:
	npm run lint

format:
	npx prettier --write "src/**/*.{ts,tsx}"

type-check:
	npx tsc --noEmit
