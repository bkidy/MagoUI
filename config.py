import os
from typing import Dict, Any

class Config:
    # API配置
    # 按照OpenAI的格式适配的，如果是OpenAI的，base_url 应该设置为 https://api.openai.com/v1
    # 如果是中转的话，就填中转的地址，然后填上api_key
    OPENAI_API_KEY = ""
    OPENAI_BASE_URL = ""
    
    # 安全配置
    # 这个token是用来验证用户的，如果用户没有这个token，那么他不能使用这个服务
    # 可以随便填，但是要记住，我之前是在内网给同事用，所以有这个需求
    VALID_TOKEN = "Elliotbai"

    
    # 下面的配置尽量别动
    # CORS配置
    CORS_CONFIG = {
        "allow_origins": ["*"],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    
    # 文件路径配置
    WEBSITE_BASE_PATH = "./website/src"
    
    @classmethod
    def get_user_component_path(cls, user_id: str) -> str:
        return f"{cls.WEBSITE_BASE_PATH}/components/user/{user_id}.tsx"
    
    @classmethod
    def get_user_backup_folder(cls, user_id: str) -> str:
        return f"{cls.WEBSITE_BASE_PATH}/backups/{user_id}"