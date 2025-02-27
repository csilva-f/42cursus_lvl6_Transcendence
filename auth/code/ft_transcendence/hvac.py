import os
import hvac

def get_database_credentials():
    client = hvac.Client(url=os.getenv('VAULT_ADDR'), token=os.getenv('VAULT_TOKEN'))
    try:
        response = client.secrets.database.generate_credentials('role-auth-db')
        return response['data']['username'], response['data']['password']
    except Exception as e:
        print(f"Error fetching credentials from Vault: {e}")
        return None, None
