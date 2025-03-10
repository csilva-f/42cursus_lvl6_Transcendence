import os
import hvac

def read_docker_secret(secret_name):
    secret_path = os.getenv('VAULT_ROOT_TOKEN_FILE',f'/run/secrets/{secret_name}')
    try:
        with open(secret_path, 'r') as secret_file:
            token = secret_file.read().strip()
            return token
    except FileNotFoundError:
        return None


def get_database_credentials():
    token=read_docker_secret('VAULT_ROOT_TOKEN')
    client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=token)
    #client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=os.getenv('VAULT_ROOT_TOKEN'))
    try:
        response = client.secrets.database.generate_credentials(os.getenv('VAULT_ROLE',""))
        return response['data']['username'], response['data']['password']
    except Exception as e:
        print(f"Error fetching credentials from Vault: {e}")
        return None, None
