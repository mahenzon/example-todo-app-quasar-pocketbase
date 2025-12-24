# VPS Deployment Guide

This guide provides step-by-step instructions for deploying the Todo application on a VPS with:
- PocketBase as a systemd service
- Frontend served via Nginx
- SSL with Let's Encrypt (auto-redirect HTTP → HTTPS)
- Single domain routing (`/api/` and `/_/` → PocketBase, everything else → Frontend)

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │              Nginx (Port 80/443)         │
                    │                                          │
                    │  /api/*  ────────┐                       │
                    │  /_/*    ────────┼──► PocketBase :8090   │
                    │                  │                       │
                    │  /*      ────────┴──► Static Frontend    │
                    │                      (/var/www/todo-app) │
                    └─────────────────────────────────────────┘
```

## Prerequisites

- Ubuntu 22.04+ VPS (or similar Debian-based distro)
- Domain name pointed to your VPS IP
- SSH access with sudo privileges
- Installed: `nginx`, `certbot`, `python3-certbot-nginx`, `unzip`, `curl`, `git`, `nodejs` (20.x), `npm`

**Replace placeholders:**
- `your-domain.com` → Your actual domain name
- `<your-repo-url>` → Your Git repository URL

---

## Step 1: Clone Repository

```bash
# Create app directory and clone
sudo mkdir -p /opt/todo-app
sudo chown $USER:$USER /opt/todo-app
cd /opt/todo-app
git clone <your-repo-url> .
```

---

## Step 2: Setup PocketBase

### 2.1 Download PocketBase for Linux

```bash
cd /opt/todo-app
make setup PB_OS=linux PB_ARCH=amd64
```

### 2.2 Run Migrations

```bash
make migrate-up
```

### 2.3 Create Superuser (First Time Only)

Create the admin account via terminal:

```bash
make create-superuser EMAIL=admin@your-domain.com PASS=your-secure-password
```

This runs `./backend/pocketbase superuser create EMAIL PASS` under the hood.

### 2.4 Install Systemd Service

```bash
make install-service
```

This copies `deploy/pocketbase.service` to systemd and enables it.

### 2.5 Start PocketBase

```bash
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

**Verify:**
```bash
curl http://127.0.0.1:8090/api/health
# Should return: {"code":200,"message":"API is healthy."}
```

---

## Step 3: Build and Deploy Frontend

### 3.1 Install Dependencies

```bash
cd /opt/todo-app/frontend
npm install
```

### 3.2 Build for Production

```bash
cd /opt/todo-app
make build-prod DOMAIN=your-domain.com
```

### 3.3 Deploy to Nginx Directory

```bash
make deploy-frontend-local
```

---

## Step 4: Configure Nginx

### 4.1 Install Nginx Configuration

```bash
make install-nginx DOMAIN=your-domain.com
```

This generates nginx config from template with your domain and installs it.

### 4.2 Enable Site (Before SSL)

First, create a temporary HTTP-only config for SSL certificate generation:

```bash
# Create certbot directory
sudo mkdir -p /var/www/certbot

# Create temporary config for certbot
cat << 'EOF' | sudo tee /etc/nginx/sites-available/todo-app-temp
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Waiting for SSL setup';
        add_header Content-Type text/plain;
    }
}
EOF

# Replace domain placeholder
sudo sed -i 's/your-domain.com/YOUR_ACTUAL_DOMAIN/g' /etc/nginx/sites-available/todo-app-temp

# Enable temp config
sudo ln -sf /etc/nginx/sites-available/todo-app-temp /etc/nginx/sites-enabled/todo-app
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 5: SSL Certificate

### 5.1 Obtain Certificate

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d your-domain.com
```

### 5.2 Enable Full Configuration

```bash
# Switch to full config with SSL
sudo ln -sf /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/todo-app
sudo rm -f /etc/nginx/sites-available/todo-app-temp
sudo nginx -t && sudo systemctl reload nginx
```

### 5.3 Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## Step 6: Verify Deployment

```bash
# Test endpoints
curl https://your-domain.com/api/health
curl -I https://your-domain.com/
curl -I https://your-domain.com/_/
```

**Browser Tests:**
1. `https://your-domain.com/` - Frontend
2. `https://your-domain.com/_/` - PocketBase Admin Dashboard
3. Test login/register functionality
4. Test realtime updates

---

## Updates

### Update Application

```bash
cd /opt/todo-app
git pull
make update DOMAIN=your-domain.com
```

### Update PocketBase Only

```bash
cd /opt/todo-app
make update-pocketbase PB_VERSION=0.36.0
```

### Update Frontend Only

```bash
cd /opt/todo-app
make update-frontend DOMAIN=your-domain.com
```

---

## Makefile Commands Reference

Run these from `/opt/todo-app`:

| Command | Description |
|---------|-------------|
| `make setup PB_OS=linux PB_ARCH=amd64` | Download PocketBase for Linux |
| `make create-superuser EMAIL=x PASS=y` | Create PocketBase admin account |
| `make build-prod DOMAIN=example.com` | Build frontend for production |
| `make install-service` | Install PocketBase systemd service |
| `make install-nginx DOMAIN=example.com` | Install nginx configuration |
| `make deploy-frontend-local` | Copy built frontend to /var/www/todo-app |
| `make update DOMAIN=example.com` | Full update (frontend + migrations) |
| `make update-frontend DOMAIN=example.com` | Update frontend only |
| `make update-pocketbase PB_VERSION=x.x.x` | Update PocketBase binary |
| `make migrate-up` | Run database migrations |
| `make logs` | View PocketBase logs |
| `make status` | Check services status |
| `make restart` | Restart all services |

---

## Troubleshooting

### PocketBase Not Starting

```bash
# Check logs
sudo journalctl -u pocketbase -n 50

# Test manual start
cd /opt/todo-app/backend
./pocketbase serve --http=127.0.0.1:8090
```

### Nginx 502 Bad Gateway

```bash
# Check if PocketBase is running
sudo systemctl status pocketbase
curl http://127.0.0.1:8090/api/health
```

### SSL Certificate Issues

```bash
sudo certbot certificates
sudo certbot renew
```

### Frontend Not Loading

```bash
ls -la /var/www/todo-app/
sudo chown -R www-data:www-data /var/www/todo-app
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start PocketBase | `sudo systemctl start pocketbase` |
| Stop PocketBase | `sudo systemctl stop pocketbase` |
| Restart PocketBase | `sudo systemctl restart pocketbase` |
| PocketBase Logs | `sudo journalctl -u pocketbase -f` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Test Nginx Config | `sudo nginx -t` |
| Renew SSL | `sudo certbot renew` |