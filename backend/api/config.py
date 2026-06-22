from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""      # postgresql://postgres:[pass]@db.xxxx.supabase.co:5432/postgres
    GROQ_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    SUPABASE_JWKS_URL: str = ""   # https://<ref>.supabase.co/auth/v1/.well-known/jwks.json
    DEV_AUTH_BYPASS: bool = False  # set true in .env for local testing — never in prod
    APP_ENV: str = "development"
    ALLOWED_ORIGIN: str = "http://localhost:3000"


settings = Settings()
