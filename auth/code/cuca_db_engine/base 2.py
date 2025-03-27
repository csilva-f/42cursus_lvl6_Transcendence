from django.db.backends.postgresql.base import DatabaseWrapper as PostgresDatabaseWrapper
from .hvac import VaultDatabaseCredentials

class DatabaseWrapper(PostgresDatabaseWrapper):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.vault_creds = VaultDatabaseCredentials()  # Instantiate the VaultDatabaseCredentials class

    def get_connection_params(self):
        # Fetch credentials from your vault
        credentials = self.get_credentials_from_vault()
        params = super().get_connection_params()
        params['user'] = credentials['username']
        params['password'] = credentials['password']
        return params

    def get_credentials_from_vault(self):
        # Get database credentials from Vault
        credentials = self.vault_creds.get_database_credentials()
        if credentials is None:
            raise Exception("Failed to retrieve database credentials from Vault.")

        #print(f"DB_USERNAME: {credentials['username']}")
        #print(f"DB_PASSWORD: {credentials['password']}")

        # Check if the lease is expiring soon and renew if necessary
        if self.vault_creds.is_lease_expiring_soon():
            self.vault_creds.renew_lease()

        return credentials
