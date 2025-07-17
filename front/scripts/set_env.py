import os
from dotenv import dotenv_values

env = dotenv_values("../.env.local")

app_name = os.environ.get("APP_NAME_TEST", "default_app")
resourse_group = os.environ.get("RESOURCE_GROUP", "default_resource_group")

settings = ' '.join([
    f'{key}="{value}"' for key, value in env.items()
])

cmd = f'az functionapp config appsettings set --name {app_name} --resource-group {resourse_group} --settings {settings}'

print(f"Running command: {cmd}")
os.system(cmd)