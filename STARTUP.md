# Starting the app when the VPS boots

## Backend (Node.js API)

### Option A: systemd (recommended)

1. Copy the example service and set your project path:
   ```bash
   sudo cp smbistro-backend.service.example /etc/systemd/system/smbistro-backend.service
   sudo nano /etc/systemd/system/smbistro-backend.service
   ```
   Replace both `/path/to/restaurant-table-reservation-system` with the real path (e.g. `/home/youruser/restaurant-table-reservation-system`).

2. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable smbistro-backend
   sudo systemctl start smbistro-backend
   ```

3. After a reboot, the backend will start automatically in a screen session named `smbistro-backend`.

### Option B: cron @reboot

Add to crontab (`crontab -e`):
```
@reboot /path/to/restaurant-table-reservation-system/start-all.sh
```

## Frontend

The frontend is static files served by **nginx**. Nginx usually starts at boot. Enable it if needed:
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Manual commands

- **Start backend (in screen):** `./start-backend.sh`
- **Restart backend:** `./restart-backend.sh`
- **Attach to backend screen (see logs):** `screen -r smbistro-backend` (detach with Ctrl+A then D)

## Admin “Restart backend” button

1. In the server `.env` (in `back-end/`), set:
   ```
   ADMIN_RESTART_SECRET=your-secret-string
   ```
2. In Admin Settings, open the “Server” section, enter the same secret, and click “Restart backend”.
