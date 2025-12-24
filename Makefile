PB_VERSION=0.35.0
PB_OS=darwin
PB_ARCH=arm64
POCKETBASE_URL?=http://127.0.0.1:8090

.PHONY: setup dev build build-frontend

setup:
	mkdir -p backend
	# Download PocketBase
	curl -L -o backend/pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v$(PB_VERSION)/pocketbase_$(PB_VERSION)_$(PB_OS)_$(PB_ARCH).zip
	unzip -o backend/pocketbase.zip -d backend/
	rm backend/pocketbase.zip
	chmod +x backend/pocketbase

dev:
	# Run backend and frontend concurrently
	# This is a simple implementation, might need a tool like concurrently or just two terminals
	@echo "Please run 'make dev-backend' and 'make dev-frontend' in separate terminals"

dev-backend:
	./backend/pocketbase serve

dev-frontend:
	cd frontend && npm run dev

build-frontend:
	cd frontend && POCKETBASE_URL=$(POCKETBASE_URL) npm run build

# Migration commands
migrate-up:
	cd backend && ./pocketbase migrate up

migrate-down:
	cd backend && ./pocketbase migrate down 1

migrate-create:
	@read -p "Migration name: " name; \
	cd backend && ./pocketbase migrate create $$name

migrate-sync:
	cd backend && ./pocketbase migrate history-sync
