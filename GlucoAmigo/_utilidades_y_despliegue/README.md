# GlucoAmigo Deployment

This project is a Flask application originally using SQLite for development. The following steps prepare it for deployment on **Render** and use a **Neon** PostgreSQL database.

## Changes included

* `app.py` now reads `DATABASE_URL` from environment and falls back to SQLite locally.
* Added `Procfile`, `runtime.txt` and `render.yaml` for Render.
* Updated `requirements.txt` with `gunicorn` and `psycopg2-binary`.

## Render setup

1. Create a new Web Service in Render, connect it to this repo.
2. For `Build Command` use: `pip install -r requirements.txt` (already in render.yaml).
3. For `Start Command` use: `gunicorn server:app --log-file -`.
4. Add environment variables:
   * `SECRET_KEY` (Render can generate one).
   * `DATABASE_URL` – copy the connection string from your Neon cluster.

## Neon (Postgres) setup

1. Sign up at <https://neon.tech> and create a new PostgreSQL cluster.
2. Allow connections from Render (set `trusted_extensions` or use `neon` builtin). The connection string looks like:

   ```
   postgres://<user>:<password>@<host>:<port>/<database>
   ```

3. Copy the full URI and paste it into Render as the value of `DATABASE_URL`.
   * Alternatively, you can use Render's managed database by uncommenting the `databases` section in `render.yaml`.

## Local development

Run the app locally with:

```bash
pip install -r requirements.txt
python server.py
```

It will create `instance/glucoamigo.db` for local storage.

----

Feel free to modify the `render.yaml` if you need different regions, plans, or add background workers.
