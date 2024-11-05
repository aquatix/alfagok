# alfagok

Omdat Nederlanders ook [alphaguess](https://alphaguess.com) willen spelen :)

My own implementation of an alphaguess like game with custom word lists, tailored to be used with a Dutch source.

Using Alpine.js on the frontend and FastAPI as backend.


## Environment variables

```fish
set -x WORD_LIST /path/to/alfagok_wordlist.txt
set -x START_DATE 2024-11-02
set -x DICTIONARY_LIST /path/to/dictionary.txt
```

In `src/alfagok`, with an active virtualenv with packages installed (`uv pip sync requirements.txt`), run:

`fastapi dev main.py`


## Example configs

### nginx

/etc/nginx/sites-enabled/alfagok.example.com.conf

```nginx
server {
    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    server_name alfagok.example.com;

    real_ip_header      X-Forwarded-For;

    access_log  /var/log/nginx/access_alfagok.example.com.log;
    error_log  /var/log/nginx/error_alfagok.example.com.log  warn;

    location / {
        proxy_pass             http://127.0.0.1:8889;
        proxy_read_timeout     60;
        proxy_connect_timeout  60;
        proxy_redirect         off;

        # Allow the use of websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    ssl_certificate /etc/letsencrypt/live/alfagok.example.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/alfagok.example.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = alfagok.example.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen [::]:80;
    listen 80;
    server_name alfagok.example.com;
    return 404; # managed by Certbot
}
```

### systemd unit file

/etc/systemd/system/alfagok.service

```ini
[Unit]
Description=Gunicorn Daemon for alfagok game FastAPI
After=network.target

[Service]
User=USERNAME (fill in!)
Group=USERGROUP (fill in!)
WorkingDirectory=/srv/www/alfagok.example.com/alfagok/src

Environment="START_DATE=2024-11-02"
Environment="WORD_LIST=/srv/www_data/alfagok.example.com/wordlist.txt"
Environment="DICTIONARY_LIST=/srv/www_data/alfagok.example.com/dictionary.txt"
Environment="STATIC_DIR=/srv/www/alfagok.example.com/alfagok/src/alfagok/static"
Environment="TEMPLATE_DIR=/srv/www/alfagok.example.com/alfagok/src/alfagok/templates"

ExecStart=/srv/www/alfagok.example.com/venv/bin/gunicorn -c /srv/www/_webconfig/sites/alfagok.diginaut.net/gunicorn_alfagok_conf.py alfagok.main:app

[Install]
WantedBy=multi-user.target
```

### gunicorn config file

```python
# gunicorn_conf.py
from multiprocessing import cpu_count

bind = "127.0.0.1:8889"

# Worker Options
#workers = cpu_count() + 1
workers = 1
worker_class = 'uvicorn.workers.UvicornWorker'

# Logging Options, dir should be writable for User in systemd unit file
loglevel = 'debug'
accesslog = '/var/log/alfagok/access_log'
errorlog = '/var/log/alfagok/error_log'
```
