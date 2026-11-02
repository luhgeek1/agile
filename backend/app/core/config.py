from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./kopilka.db"
    allowed_origins: str = (
        "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:4173,http://127.0.0.1:8017"
    )
    cookie_secure: bool = False
    demo_enabled: bool = True
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
