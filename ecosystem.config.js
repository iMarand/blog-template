module.exports = {
    apps: [
        {
            name: 'blog',
            script: './build/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                DATABASE_PATH: '/var/www/my-blog/data/blog.db',
                POSTS_PATH: '/var/www/my-blog/data/posts',
                UPLOADS_PATH: '/var/www/my-blog/public_uploads'
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        }
    ]
};
