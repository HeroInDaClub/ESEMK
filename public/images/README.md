# Image files

Put local fallback images here:

- `clinic-placeholder.svg` - fallback image for clinics.
- `doctor-placeholder.svg` - fallback image for doctors.

You can use `.png`, `.jpg`, `.webp`, or `.svg`, but if you change file names or extensions, update `src/lib/imageFallback.ts`.

For real seeded photos, update `photo_url` values in `fastapi_backend/seed.py`, then recreate the Docker database:

```bash
docker compose down -v
docker compose up --build
```
