import os
import hvac
from django.core.management.utils import get_random_secret_key

def read_docker_secret(secret_name):
    secret_path = os.getenv('VAULT_ROOT_TOKEN_FILE',f'/run/secrets/{secret_name}')
    try:
        with open(secret_path, 'r') as secret_file:
            token = secret_file.read().strip()
            return token
    except FileNotFoundError:
        return None

def read_host_ip():
    secret_path = f'/run/secrets/host_ip'
    try:
        with open(secret_path, 'r') as secret_file:
            host_ip = secret_file.read().strip()
            return host_ip
    except FileNotFoundError:
        return None

def get_secret_key():
    token=read_docker_secret('VAULT_ROOT_TOKEN')
    client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=token)
    secret_path = 'django-auth'
    try:
        secret = client.secrets.kv.read_secret_version(path=secret_path)
        key = secret['data']['data']['secret_key']
        return key
    except hvac.exceptions.InvalidPath:
        secret_key = get_random_secret_key()
        # Store the new secret key in Vault
        try:
            client.secrets.kv.create_or_update_secret(
                path=secret_path,
                secret={'secret_key': secret_key}
            )
            return get_secret_key()
        except Exception as e:
            print(f"Error storing secret key in Vault: {e}")
            return None

def get_oauth_config():
    token = read_docker_secret('VAULT_ROOT_TOKEN')
    client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=token)
    secret_path = 'oauth_config'  # This is the path relative to the mount point
    try:
        secret = client.secrets.kv.read_secret_version(path=secret_path)
        config = secret['data']
        print("OAuth configuration retrieved successfully")
        return config
    except Exception as e:
        print(f"Error getting key from Vault: {e}")
        return None
