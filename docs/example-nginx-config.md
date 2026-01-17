## Example config for nginx

```nginx
upstream pb_upstream {
    server 127.0.0.1:8090;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name etodo.mahenzon.ru;
    client_max_body_size 10M;

    location ^~ /api/ {
        proxy_pass http://pb_upstream;

        proxy_set_header Connection '';
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (PocketBase realtime)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Disable buffering for realtime/SSE-ish behavior
        proxy_buffering off;
        proxy_cache off;

        # Long timeouts
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location ^~ /_/ {
        proxy_pass http://pb_upstream;

        proxy_set_header Connection '';
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ---- Cache static assets aggressively ----
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

## pocketbase service behind nginx

```ini
[Unit]
Description=PocketBase Service (HTTP)
After=network.target

[Service]
Type=simple
User=suren
Group=suren
WorkingDirectory=/opt/todo-app/backend
ExecStart=/opt/todo-app/backend/pocketbase serve --http 127.0.0.1:8090
Restart=always
RestartSec=5s
LimitNOFILE=8192

NoNewPrivileges=yes
PrivateTmp=yes
ProtectHome=yes

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
sudo systemctl status pocketbase.service
```
