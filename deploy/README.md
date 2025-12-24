# Deployment Configuration Files

This directory contains configuration templates for deploying the Todo application on a VPS.

## Files

| File | Description |
|------|-------------|
| `pocketbase.service` | Systemd service unit for running PocketBase |
| `nginx.conf` | Nginx configuration template with SSL, routing for API and frontend |

## Deployment Workflow

The recommended deployment workflow uses `git pull` on the server:

```bash
# 1. Clone repository on VPS (first time only)
cd /opt/todo-app
git clone <your-repo-url> .

# 2. Setup PocketBase
make setup PB_OS=linux PB_ARCH=amd64

# 3. Install systemd service
make install-service

# 4. Build and deploy frontend
make build-prod DOMAIN=your-domain.com
make deploy-frontend-local

# 5. Install nginx config
make install-nginx DOMAIN=your-domain.com

# 6. Start services
sudo systemctl start pocketbase
sudo systemctl reload nginx
```

## Updating

After pushing changes to your repository:

```bash
# Full update (recommended)
make update DOMAIN=your-domain.com

# Or individual updates:
make update-frontend DOMAIN=your-domain.com
make update-pocketbase PB_VERSION=0.36.0
```

## Configuration Details

### PocketBase Service (`pocketbase.service`)

The systemd service:
- Runs PocketBase on `127.0.0.1:8090` (only accessible via nginx)
- Auto-restarts on failure
- Includes security hardening options

Modify if you need to:
- Change the installation path (default: `/opt/todo-app/backend`)
- Run as different user (default: `root`)
- Adjust restart behavior

### Nginx Configuration (`nginx.conf`)

The nginx config template:
- Uses `your-domain.com` as placeholder (replaced automatically by `make install-nginx`)
- Routes `/api/*` and `/_/*` to PocketBase
- Serves frontend SPA from `/var/www/todo-app`
- Includes SSL configuration for Let's Encrypt certificates
- WebSocket support for realtime features
- Gzip compression
- Static asset caching

#### Customizations

**Restrict admin access to specific IPs:**
```nginx
location /_/ {
    allow 192.168.1.0/24;
    allow YOUR_IP;
    deny all;
    
    proxy_pass http://127.0.0.1:8090;
    # ... rest of config
}
```

## SSL Setup

The nginx config expects SSL certificates from Let's Encrypt at:
- `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
- `/etc/letsencrypt/live/your-domain.com/privkey.pem`

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for SSL setup instructions.

## Useful Commands

```bash
# View logs
make logs                    # PocketBase logs
sudo tail -f /var/log/nginx/todo-app.error.log

# Service management  
make status                  # Check all services
make restart                 # Restart all services
sudo systemctl restart pocketbase
sudo systemctl reload nginx

# Test nginx config
sudo nginx -t
