# Blog Deployment Guide

## Prerequisites

- VPS with Ubuntu/Debian
- Node.js 18+ installed
- Nginx installed
- PM2 installed globally (`npm install -g pm2`)

## VPS Setup

### 1. Create Directory Structure

```bash
sudo mkdir -p /var/www/my-blog
cd /var/www/my-blog
sudo mkdir -p data/posts public_uploads logs
```

### 2. Upload Your Code

```bash
# On your local machine, build the project
npm run build

# Upload to VPS (using scp, rsync, or git)
scp -r ./build your_user@your_vps:/var/www/my-blog/
scp -r ./node_modules your_user@your_vps:/var/www/my-blog/
scp ./package.json your_user@your_vps:/var/www/my-blog/
scp ./ecosystem.config.js your_user@your_vps:/var/www/my-blog/
```

### 3. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/my-blog
sudo chmod -R 755 /var/www/my-blog
sudo chmod -R 775 /var/www/my-blog/data
sudo chmod -R 775 /var/www/my-blog/public_uploads
```

### 4. Install Dependencies on VPS

```bash
cd /var/www/my-blog
npm install --production
```

## Database Initialization

The database will auto-initialize on first run, creating the default admin user:
- Username: `admin`
- Password: `admin123`

**IMPORTANT:** Change the default password immediately after first login!

## PM2 Configuration

### Start the Application

```bash
cd /var/www/my-blog
pm2 start ecosystem.config.js
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs blog

# Restart
pm2 restart blog

# Stop
pm2 stop blog

# Auto-start on system boot
pm2 startup
pm2 save
```

## Nginx Configuration

### 1. Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/blog
```

Paste the contents from `nginx.conf.example` and update `yourdomain.com` with your actual domain.

### 2. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL Setup with Let's Encrypt (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

For portability, you can customize paths using environment variables:

```bash
# In ecosystem.config.js, modify the env object:
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  DATABASE_PATH: '/var/www/my-blog/data/blog.db',
  POSTS_PATH: '/var/www/my-blog/data/posts',
  UPLOADS_PATH: '/var/www/my-blog/public_uploads'
}
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
nano /var/www/my-blog/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/www/my-blog/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/my-blog/data/blog.db $BACKUP_DIR/blog_$DATE.db

# Backup posts
tar -czf $BACKUP_DIR/posts_$DATE.tar.gz /var/www/my-blog/data/posts/

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/my-blog/public_uploads/

# Keep only last 7 backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /var/www/my-blog/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /var/www/my-blog/backup.sh
```

## Portability Features

This blog template is designed to be easily portable:

1. **Configurable Paths**: All paths (database, posts, uploads) are configurable via environment variables
2. **Self-Contained**: SQLite database and local file storage mean no external dependencies
3. **Simple Migration**: Just copy the `data/` and `public_uploads/` folders to move your content
4. **No Cloud Dependencies**: Everything runs locally on your VPS

## Updating the Application

```bash
# On local machine
npm run build

# Upload new build to VPS
scp -r ./build your_user@your_vps:/var/www/my-blog/

# On VPS
cd /var/www/my-blog
pm2 restart blog
```

## Troubleshooting

### Check Application Logs

```bash
pm2 logs blog
```

### Check Nginx Logs

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Database Issues

```bash
# Check database file permissions
ls -la /var/www/my-blog/data/blog.db

# Ensure write permissions
sudo chmod 664 /var/www/my-blog/data/blog.db
sudo chown www-data:www-data /var/www/my-blog/data/blog.db
```

## Security Recommendations

1. Change default admin password immediately
2. Set up SSL/HTTPS with Let's Encrypt
3. Configure firewall (ufw) to only allow ports 80, 443, and SSH
4. Keep Node.js and system packages updated
5. Regularly backup your data
6. Consider adding rate limiting in Nginx for admin routes

## Support

For issues or questions, check the application logs first. Most issues are related to file permissions or environment variables.
