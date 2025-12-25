## Pocketbase deploy example

### Install node

Use nvm to get latest nodejs.

Check version:

```bash
node --version
```

### Build frontend using makefile

Go to the dir with your app, for example `/opt/todo-app`

Build frontend:

```bash
make build-prod DOMAIN=your-domain
```

### Copy files into `pb_public` in pocketbase's dir, for example:

```bash
cp -r /opt/todo-app/frontend/dist/spa/* /opt/todo-app/backend/pb_public/
```

### Create user (or use your user)

```bash
sudo adduser --system --group --no-create-home pocketbase
sudo mkdir -p /opt/todo-app/backend
sudo chown -R pocketbase:pocketbase /opt/todo-app/backend
sudo chmod 750 /opt/todo-app/backend
```

### Edit systemd service file

You can use `nano`:
```bash
sudo nano /etc/systemd/system/pocketbase.service
```

And paste there this content:

```ini
[Unit]
Description=PocketBase Service (HTTPS)
After=network.target

[Service]
Type=simple
User=suren  # or your user, or pocketbase
Group=suren  # or your user, or pocketbase
WorkingDirectory=/opt/todo-app/backend
ExecStart=/opt/todo-app/backend/pocketbase serve --https etodo.mahenzon.ru:443
Restart=always
RestartSec=5s
LimitNOFILE=8192

# Critical security settings
AmbientCapabilities=CAP_NET_BIND_SERVICE  # Allows binding to port 443
NoNewPrivileges=yes
PrivateTmp=yes
#ProtectSystem=strict
ProtectHome=yes
#ReadWritePaths=/opt/todo-app/backend/

# Prevent accessing other services
RestrictSUIDSGID=yes
RestrictAddressFamilies=AF_INET AF_INET6
LockPersonality=yes

[Install]
WantedBy=multi-user.target
```

### Enable and run service

Reload daemon and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase.service
sudo systemctl enable start pocketbase.service
```

Check service status:

```bash
sudo systemctl enable start pocketbase.service
```

Check logs:

```bash
# Show latest 10 lines for service:
sudo journalctl -u pocketbase.service -n 10

# View all logs
sudo journalctl -u pocketbase.service

# Live logs with timestamps (like tail -f)
sudo journalctl -u pocketbase.service -f --since "5 minutes ago" -o short-precise

# Show only errors
sudo journalctl -u pocketbase.service -p 3

# Logs since last boot
sudo journalctl -u pocketbase.service -b
```