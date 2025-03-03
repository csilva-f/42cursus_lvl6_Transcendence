import os
import hvac

def read_docker_secret(secret_name):
    secret_path = os.getenv('VAULT_ROOT_TOKEN_FILE',f'/run/secrets/{secret_name}.txt')
    try:
        with open(secret_path, 'r') as secret_file:
            return secret_file.read().strip()
    except FileNotFoundError:
        return None


def get_database_credentials():
    client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=read_docker_secret('VAULT_ROOT_TOKEN'))
    try:
        response = client.secrets.database.generate_credentials('role-auth-db')
        return response['data']['username'], response['data']['password']
    except Exception as e:
        print(f"Error fetching credentials from Vault: {e}")
        return None, None
