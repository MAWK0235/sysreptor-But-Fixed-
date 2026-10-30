import logging
from sysreptor.plugins import PluginConfig

log = logging.getLogger(__name__)

class DesignAiChatConfig(PluginConfig):
    plugin_id = '99999999-9999-9999-9999-999999999999'
    
    def ready(self) -> None:
        log.info('Loading Design AI Chat Plugin...')
