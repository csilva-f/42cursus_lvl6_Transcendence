from django.db.backends.postgresql.base import DatabaseWrapper as PostgresDatabaseWrapper
from .hvac import get_database_credentials

class DatabaseWrapper(PostgresDatabaseWrapper):
    def get_connection_params(self):
        # Fetch credentials from your vault
        credentials = self.get_credentials_from_vault()
        params = super().get_connection_params()
        params['user'] = credentials['username']
        params['password'] = credentials['password']
        return params

    def get_credentials_from_vault(self):
        DB_USERNAME, DB_PASSWORD = get_database_credentials()
        print(f"DB_USERNAME: {DB_USERNAME}")
        print(f"DB_PASSWORD: {DB_PASSWORD}")
        return {
            'username': DB_USERNAME,
            'password': DB_PASSWORD,
        }
