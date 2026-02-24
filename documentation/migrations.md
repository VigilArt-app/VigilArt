# Database Migration Guide

Complete guide for database migrations in VigilArt with automatic rollback and production-ready deployment.

## Quick Commands

### Deploy with Migrations
```bash
# Development (on server)
cd /srv/VigilArt
sudo bash ./deploy.sh

# Production (on server)
cd /srv/VigilArt
sudo bash ./deploy.sh
```

### Run Migrations Only
```bash
doppler run -- docker compose -f docker-compose.prod.yml --profile migrate run --rm migrator
```

### Check Migration Status
```bash
doppler run -- docker compose -f docker-compose.prod.yml --profile migrate run --rm migrator \
  sh -c "cd /app/backend && pnpm exec prisma migrate status"
```

### Create New Migration (Local)
```bash
cd backend
pnpm db:migrate:dev --name "your_migration_name"
```

### Restore from Backup
```bash
# List backups
ls -lh /tmp/backup*.sql

# Restore (dev/prod)
docker exec -i $(docker compose -f docker-compose.prod.yml ps -q db) \
  psql -U $DB_USER $DB_NAME < /tmp/backup_dev_TIMESTAMP.sql

# Restart services
doppler run -- docker compose -f docker-compose.prod.yml restart backend
```

## Architecture

### Key Components

1. **Dockerfile.prod** - Builds the application WITHOUT running migrations
2. **docker-compose.prod.yml** - Defines a separate `migrator` service
3. **deploy.sh** - Orchestrates deployment with safety checks (on servers at `/srv/VigilArt/deploy.sh`, NOT in git)
4. **Database Backups** - Automatic backups before each migration

### Server-Only Files

⚠️ **Important**: The following files exist **only on servers** for security reasons:

- `/srv/VigilArt/deploy.sh` - Main deployment script (called by GitHub Actions)
- `/etc/doppler/doppler.env` - Doppler credentials

**Templates** for these files are maintained in the `infra/` folder:
- `infra/dev/dev.deploy.sh` - Template for dev deploy.sh
- `infra/prod/prod.deploy.sh` - Template for prod deploy.sh

## How It Works

### Migration Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Pull Latest Code & Images                               │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Backup Current Database                                  │
│     → /tmp/backup_[dev|prod]_YYYYMMDD_HHMMSS.sql           │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Run Migrations (separate container)                      │
│     → docker compose --profile migrate run migrator          │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   ✅ SUCCESS        ❌ FAILURE
        │                 │
        ▼                 ▼
  Deploy New        Restore Backup
  Containers        & Abort
        │
        ▼
  Health Checks
        │
   ┌────┴────┐
   ▼         ▼
✅ PASS   ❌ FAIL
   │         │
   ▼         ▼
 Done   Rollback
        (Restore DB
         & Old Image)
```

## Safety Features

### 1. Database Backups
- **Automatic** backup before each migration
- Stored in `/tmp/backup_[dev|prod]_*.sql`
- Dev: Keeps last 3 backups
- Prod: Keeps last 7 backups

### 2. Migration Failure Handling
If migration fails:
1. ✅ Database is restored from backup
2. ✅ Deployment is aborted
3. ✅ Old version keeps running
4. ✅ Clear error message displayed

### 3. Health Check Failures
If new version fails health checks:
1. ✅ Database is restored from backup
2. ✅ Previous Docker image is redeployed
3. ✅ System returns to working state

### 4. Zero Database Connection During Build
- ✅ Migrations require database access
- ✅ Docker build happens BEFORE database exists
- ✅ Solution: Separate migration step at deployment

## Best Practices

### Creating Migrations

```bash
# Development
cd backend
pnpm db:migrate:dev --name "descriptive_migration_name"
```

This creates a new migration file in `prisma/migrations/`

### Testing Migrations Locally

```bash
cd backend

# 1. Verify schema
pnpm db:studio

# 2. Test rollback (reset & re-run)
pnpm db:reset
```

### Deployment Checklist

Before deploying migrations to production:

- [ ] Test migration locally
- [ ] Ensure backward compatibility with current app version
- [ ] Review generated SQL in migration file
- [ ] Check for data loss scenarios
- [ ] Verify backup system is working
- [ ] Have a maintenance window if needed (for large migrations)
- [ ] Monitor application after deployment

### Migration Strategies

**Backwards Compatible (Zero Downtime)**
1. Adding columns - Always safe
2. Adding tables - Always safe
3. Adding indexes - Safe (use CONCURRENTLY in Postgres)

**Requires Coordination**
1. Removing columns - Deploy code first, then remove column
2. Renaming columns - Use multi-step process:
   - Step 1: Add new column, copy data
   - Step 2: Update code to use new column
   - Step 3: Remove old column
3. Changing column types - May lock table, plan accordingly

## Monitoring & Debugging

### View Logs
```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# Database logs
docker compose -f docker-compose.prod.yml logs -f db

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Connect to Database
```bash
# Via docker exec
docker exec -it $(docker compose -f docker-compose.prod.yml ps -q db) \
  psql -U $DB_USER $DB_NAME

# Local dev
pnpm --filter @vigilart/backend psql

# Prisma Studio (local)
pnpm --filter @vigilart/backend db:studio
```

### Check Health
```bash
# All services
docker compose -f docker-compose.prod.yml ps

# Backend endpoint
curl http://localhost:3001/api/v1

# Detailed container health
docker inspect --format='{{.State.Health.Status}}' \
  $(docker compose -f docker-compose.prod.yml ps -q backend)

# Resource usage
docker stats --no-stream
```

## Troubleshooting

### Migration Failed

1. Check logs for error details
2. Restore from backup (automatic in deploy.sh)
3. Fix migration file locally
4. Test thoroughly
5. Redeploy

### Database Backup Failed

**Critical**: Fix immediately before deploying

```bash
# Test backup manually
docker exec $(docker compose -f docker-compose.prod.yml ps -q db) \
  pg_dump -U $DB_USER $DB_NAME > /tmp/test_backup.sql

# Verify backup
ls -lh /tmp/test_backup.sql
```

### Complete Rollback
```bash
# 1. Stop services
docker compose -f docker-compose.prod.yml down

# 2. Restore database
docker compose -f docker-compose.prod.yml up -d db
docker exec -i $(docker compose -f docker-compose.prod.yml ps -q db) \
  psql -U $DB_USER $DB_NAME < /tmp/backup_TIMESTAMP.sql

# 3. Restart services
docker compose -f docker-compose.prod.yml up -d
```

### Migration Stuck

```bash
# 1. Check migration status
doppler run -- docker compose -f docker-compose.prod.yml \
  --profile migrate run --rm migrator \
  sh -c "cd /app/backend && pnpm exec prisma migrate status"

# 2. Connect to database and investigate
docker exec -it $(docker compose -f docker-compose.prod.yml ps -q db) \
  psql -U $DB_USER $DB_NAME

# Check migration table
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

## Maintenance

### Cleanup
```bash
# Remove unused images
docker image prune -f

# Remove old backups (keeping last 3)
cd /tmp && ls -t backup*.sql | tail -n +4 | xargs -r rm

# Full cleanup (careful!)
docker system prune -a
```

### Update Images
```bash
# Pull latest
doppler run -- docker compose -f docker-compose.prod.yml pull

# Restart
doppler run -- docker compose -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Development
- Branch: `dev`
- IMAGE_TAG: `dev`
- Backup prefix: `backup_dev_`
- Backup retention: Last 3
- Health check timeout: 30 seconds

### Production
- Branch: `main`
- IMAGE_TAG: `prod`
- Backup prefix: `backup_prod_`
- Backup retention: Last 7
- Health check timeout: 60 seconds
- Stricter backup requirements (must succeed)

## GitHub Actions CI/CD

The deployment process includes a **smoke test** that validates:

1. ✅ Docker images build successfully
2. ✅ Database migrations run without errors
3. ✅ Backend passes health checks (via `--wait` flag)
4. ✅ All services start correctly

This happens **before** deploying to the actual server, ensuring broken code never reaches production.

After smoke tests pass, GitHub Actions:
1. Pushes Docker images to GitHub Container Registry
2. SSHs into the server
3. Calls `/srv/VigilArt/deploy.sh`

## Further Reading

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Zero-Downtime Migrations](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
