FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

# Run migrations, seed reference data, then start server
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
