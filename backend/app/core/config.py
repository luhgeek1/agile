from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./kopilka.db"
    allowed_origins: str = (
        "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:4173,http://127.0.0.1:8017"
    )
    cookie_secure: bool = False
    demo_enabled: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
