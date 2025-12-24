PB_VERSION?=0.35.0
PB_OS?=darwin
PB_ARCH?=arm64
POCKETBASE_URL?=http://localhost:9000
FRONTEND_DEPLOY_PATH?=/var/www/todo-app

.PHONY: setup dev build build-frontend lint format help
.PHONY: migrate-up migrate-down migrate-create migrate-sync
.PHONY: build-prod install-service install-nginx deploy-frontend-local
.PHONY: update update-frontend update-pocketbase logs status restart

# ==================== Local Development ====================

setup:
	mkdir -p backend
	curl -L -o backend/pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v$(PB_VERSION)/pocketbase_$(PB_VERSION)_$(PB_OS)_$(PB_ARCH).zip
	unzip -o backend/pocketbase.zip -d backend/
	rm backend/pocketbase.zip
	chmod +x backend/pocketbase
	@echo "PocketBase $(PB_VERSION) installed for $(PB_OS)/$(PB_ARCH)"

dev:
	@echo "Run 'make dev-backend' and 'make dev-frontend' in separate terminals"

dev-backend:
	./backend/pocketbase serve

dev-frontend:
	cd frontend && POCKETBASE_URL=$(POCKETBASE_URL) npm run dev

build-frontend:
	cd frontend && POCKETBASE_URL=$(POCKETBASE_URL) npm run build

# ==================== Code Quality ====================

lint:
	cd frontend && npm run lint

format:
	cd frontend && npm run format

# ==================== Migration Commands ====================

migrate-up:
	cd backend && ./pocketbase migrate up

migrate-down:
	cd backend && ./pocketbase migrate down 1

migrate-create:
	@read -p "Migration name: " name; \
	cd backend && ./pocketbase migrate create $$name

migrate-sync:
	cd backend && ./pocketbase migrate history-sync

# ==================== Admin Commands ====================

# Create superuser (admin) account
create-superuser:
	@if [ -z "$(EMAIL)" ] || [ -z "$(PASS)" ]; then \
		echo "Error: EMAIL and PASS are required."; \
		echo "Usage: make create-superuser EMAIL=admin@example.com PASS=yourpassword"; \
		exit 1; \
	fi
	cd backend && ./pocketbase superuser create $(EMAIL) $(PASS)
	@echo "Superuser created: $(EMAIL)"

# ==================== Production (Server-Side Commands) ====================
# Run these commands on the VPS after git pull

# Build frontend for production with HTTPS URL
build-prod:
	@if [ -z "$(DOMAIN)" ]; then \
		echo "Error: DOMAIN is required. Usage: make build-prod DOMAIN=your-domain.com"; \
		exit 1; \
	fi
	cd frontend && npm ci && POCKETBASE_URL=https://$(DOMAIN) npm run build
	@echo "Frontend built with POCKETBASE_URL=https://$(DOMAIN)"

# Install PocketBase systemd service
install-service:
	sudo cp deploy/pocketbase.service /etc/systemd/system/pocketbase.service
	sudo systemctl daemon-reload
	sudo systemctl enable pocketbase
	@echo "PocketBase service installed and enabled"

# Install nginx configuration
install-nginx:
	@if [ -z "$(DOMAIN)" ]; then \
		echo "Error: DOMAIN is required. Usage: make install-nginx DOMAIN=your-domain.com"; \
		exit 1; \
	fi
	sed 's/your-domain.com/$(DOMAIN)/g' deploy/nginx.conf | sudo tee /etc/nginx/sites-available/todo-app > /dev/null
	sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/todo-app
	sudo nginx -t
	@echo "Nginx config installed for $(DOMAIN). Run 'sudo systemctl reload nginx' to apply."

# Deploy built frontend to nginx directory
deploy-frontend-local:
	sudo mkdir -p $(FRONTEND_DEPLOY_PATH)
	sudo cp -r frontend/dist/spa/* $(FRONTEND_DEPLOY_PATH)/
	sudo chown -R www-data:www-data $(FRONTEND_DEPLOY_PATH)
	@echo "Frontend deployed to $(FRONTEND_DEPLOY_PATH)"

# Full update: pull, build frontend, run migrations, restart
update:
	@if [ -z "$(DOMAIN)" ]; then \
		echo "Error: DOMAIN is required. Usage: make update DOMAIN=your-domain.com"; \
		exit 1; \
	fi
	git pull
	cd frontend && npm ci && POCKETBASE_URL=https://$(DOMAIN) npm run build
	$(MAKE) deploy-frontend-local
	$(MAKE) migrate-up
	sudo systemctl restart pocketbase
	@echo "Update complete!"

# Update frontend only
update-frontend:
	@if [ -z "$(DOMAIN)" ]; then \
		echo "Error: DOMAIN is required. Usage: make update-frontend DOMAIN=your-domain.com"; \
		exit 1; \
	fi
	git pull
	cd frontend && npm ci && POCKETBASE_URL=https://$(DOMAIN) npm run build
	$(MAKE) deploy-frontend-local
	@echo "Frontend updated!"

# Update PocketBase binary
update-pocketbase:
	@if [ -z "$(PB_VERSION)" ]; then \
		echo "Error: PB_VERSION is required. Usage: make update-pocketbase PB_VERSION=0.36.0"; \
		exit 1; \
	fi
	sudo systemctl stop pocketbase
	curl -L -o backend/pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v$(PB_VERSION)/pocketbase_$(PB_VERSION)_linux_amd64.zip
	unzip -o backend/pocketbase.zip -d backend/
	rm backend/pocketbase.zip
	chmod +x backend/pocketbase
	sudo systemctl start pocketbase
	@echo "PocketBase updated to $(PB_VERSION)"

# View PocketBase logs
logs:
	sudo journalctl -u pocketbase -f

# Check services status
status:
	@echo "=== PocketBase ==="
	@sudo systemctl status pocketbase --no-pager || true
	@echo ""
	@echo "=== Nginx ==="
	@sudo systemctl status nginx --no-pager || true

# Restart all services
restart:
	sudo systemctl restart pocketbase
	sudo systemctl reload nginx
	@echo "Services restarted!"

# ==================== Help ====================

help:
	@echo "Todo App Makefile Commands"
	@echo ""
	@echo "Local Development:"
	@echo "  make setup                              - Download PocketBase (use PB_OS=linux PB_ARCH=amd64 for Linux)"
	@echo "  make dev-backend                        - Run PocketBase locally"
	@echo "  make dev-frontend                       - Run frontend dev server"
	@echo "  make lint                               - Run ESLint"
	@echo "  make format                             - Run Prettier"
	@echo ""
	@echo "Migrations:"
	@echo "  make migrate-up                         - Run all pending migrations"
	@echo "  make migrate-down                       - Rollback last migration"
	@echo "  make migrate-create                     - Create new migration"
	@echo ""
	@echo "Admin:"
	@echo "  make create-superuser EMAIL=x PASS=y    - Create PocketBase admin account"
	@echo ""
	@echo "Production (run on server after git pull):"
	@echo "  make build-prod DOMAIN=example.com      - Build frontend for production"
	@echo "  make install-service                    - Install PocketBase systemd service"
	@echo "  make install-nginx DOMAIN=example.com   - Install nginx configuration"
	@echo "  make deploy-frontend-local              - Copy built frontend to /var/www"
	@echo "  make update DOMAIN=example.com          - Full update (git pull + build + migrate + restart)"
	@echo "  make update-frontend DOMAIN=example.com - Update frontend only"
	@echo "  make update-pocketbase PB_VERSION=x.x.x - Update PocketBase binary"
	@echo "  make logs                               - View PocketBase logs"
	@echo "  make status                             - Check services status"
	@echo "  make restart                            - Restart all services"
	@echo ""
	@echo "Configuration Variables:"
	@echo "  DOMAIN       - Domain name for production build (required for prod commands)"
	@echo "  PB_VERSION   - PocketBase version (default: 0.35.0)"
	@echo "  PB_OS        - OS for PocketBase download (default: darwin, use 'linux' for VPS)"
	@echo "  PB_ARCH      - Architecture (default: arm64, use 'amd64' for most VPS)"
