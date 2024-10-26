from django.apps import AppConfig


class AppcarolConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'appcarol'

    def ready(self):
        import appcarol.signals
