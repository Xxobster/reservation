# How to enable HTTPS on your website

HTTPS is required for the delivery **location sharing** feature (browser geolocation only works on secure origins). Below is a common way to add HTTPS on a VPS using **Nginx** and a **free Let's Encrypt** certificate.

## Prerequisites

- A **domain name** (e.g. `yourbistro.com`) pointing to your VPS (A record to the server’s public IP).
- SSH access to the VPS.
- Port **80** and **443** open in the firewall.

## 1. Install Nginx (if not already installed)

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 2. Install Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 3. Create an Nginx config for your site

Create a config file (replace `yourdomain.com` with your real domain):

```bash
sudo nano /etc/nginx/sites-available/restaurant
```

Paste (and adjust paths/domain/ports as needed):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (Vue build)
    location / {
        root /home/restaurant-table-reservation-system/inn/front-end/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (if you use a separate Node/Express server)
    location /api {
        proxy_pass http://127.0.0.1:3001;   # adjust port to match your backend
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and test:

```bash
sudo ln -s /etc/nginx/sites-available/restaurant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Get the SSL certificate

Certbot will fetch the certificate and adjust Nginx for HTTPS:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts (email, agree to terms). Certbot will:

- Get a certificate from Let's Encrypt
- Configure HTTPS in your Nginx site
- Set up automatic renewal

## 5. Optional: redirect HTTP to HTTPS

Certbot usually adds a redirect. If not, in your Nginx server block add above the existing `server { listen 80; ... }`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Build the frontend

Your Nginx config serves the **built** frontend from `dist`:

```bash
cd /home/restaurant-table-reservation-system/inn/front-end
npm install
npm run build
```

After that, open **https://yourdomain.com** in the browser. The site will be HTTPS and the delivery location feature can work when users allow location.

## Renewal

Let's Encrypt certificates expire after 90 days. Certbot installs a cron job/systemd timer to renew automatically. Test renewal with:

```bash
sudo certbot renew --dry-run
```

## If you don’t have a domain

You can’t get a normal certificate for a raw IP. Options:

- Buy a cheap domain and point it to your VPS, then use the steps above.
- Use a tunnel service (e.g. Cloudflare Tunnel, ngrok) that provides HTTPS for your server; setup depends on the service.
