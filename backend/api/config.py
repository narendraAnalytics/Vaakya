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
    APP_ENV: str = "development"
    ALLOWED_ORIGIN: str = "http://localhost:3000"


settings = Settings()
