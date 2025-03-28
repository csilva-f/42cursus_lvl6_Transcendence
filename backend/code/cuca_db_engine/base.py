from django.db.backends.postgresql.base import DatabaseWrapper as PostgresDatabaseWrapper
from .hvac import VaultDatabaseCredentials

vault_creds = VaultDatabaseCredentials()

class DatabaseWrapper(PostgresDatabaseWrapper):
    def __init__(self, *args, **kwargs):
        print("DatabaseWrapper.__init__")
        super().__init__(*args, **kwargs)
         # Instantiate the VaultDatabaseCredentials class

    def get_connection_params(self):
        # Fetch credentials from your vault
        credentials = self.get_credentials_from_vault()
        params = super().get_connection_params()
        params['user'] = credentials['username']
        params['password'] = credentials['password']
        return params

    def get_credentials_from_vault(self):
        # Get database credentials from Vault
        credentials = vault_creds.get_database_credentials()
        if credentials is None:
            raise Exception("Failed to retrieve database credentials from Vault.")

        # Check if the lease is expiring soon and renew if necessary
        if vault_creds.is_lease_expiring_soon():
            vault_creds.renew_lease()

        return credentials
