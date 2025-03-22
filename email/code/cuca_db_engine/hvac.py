import os
import hvac
from datetime import datetime, timedelta

class VaultDatabaseCredentials:
    def __init__(self):
        self.token = self.read_docker_secret('VAULT_ROOT_TOKEN')
        self.client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=self.token)
        self.lease_id = None
        self.lease_duration = None
        self.credentials = None

    def read_docker_secret(self, secret_name):
        secret_path = os.getenv('VAULT_ROOT_TOKEN_FILE', f'/run/secrets/{secret_name}')
        try:
            with open(secret_path, 'r') as secret_file:
                token = secret_file.read().strip()
                return token
        except FileNotFoundError:
            return None

    def get_database_credentials(self):
        try:
            response = self.client.secrets.database.generate_credentials(os.getenv('VAULT_ROLE'))
            self.credentials = {
                'username': response['data']['username'],
                'password': response['data']['password']
            }
            self.lease_id = response['lease_id']
            self.lease_duration = response['lease_duration']
            return self.credentials
        except Exception as e:
            print(f"Error fetching credentials from Vault: {e}")
            return None

    def renew_lease(self):
        if self.lease_id:
            try:
                response = self.client.sys.renew_lease(self.lease_id)
                self.lease_duration = response['data']['lease_duration']
                print(f"Lease renewed. New duration: {self.lease_duration} seconds.")
            except Exception as e:
                print(f"Error renewing lease: {e}")
        else:
            print("No lease ID available to renew.")

    def is_lease_expiring_soon(self, buffer_time=300):
        """Check if the lease is expiring soon (default is 5 minutes)."""
        if self.lease_duration:
            expiration_time = datetime.now() + timedelta(seconds=self.lease_duration)
            return datetime.now() >= expiration_time - timedelta(seconds=buffer_time)
        return False
