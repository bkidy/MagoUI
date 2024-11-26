from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import re
from typing import Optional
from prompt import sys_prompt
import os
from datetime import datetime
from config import Config

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    **Config.CORS_CONFIG
)

# 设置OpenAI客户端
client = OpenAI(
    api_key=Config.OPENAI_API_KEY,
    base_url=Config.OPENAI_BASE_URL
)


class Query(BaseModel):
    prompt: str
    image: Optional[str] = None
    modify_existing: bool = False
    model: str
    user_id: str  # 新增字段，用于接收用户ID


def verify_token(authorization: str = Header(...)):
    if authorization != f"Bearer {Config.VALID_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid token")
    return authorization


def extract_code_block(content: str) -> Optional[str]:
    pattern = r"```(?:jsx|tsx)?\n([\s\S]*?)\n```"
    matches = re.findall(pattern, content)
    return matches[0] if matches else None


# 修改：更新文件路径以包含用户ID
def update_tsx_file(code: str, user_id: str):
    main_file_path = Config.get_user_component_path(user_id)
    backup_folder = Config.get_user_backup_folder(user_id)
    os.makedirs(backup_folder, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file_path = os.path.join(backup_folder, f"{user_id}_{timestamp}.tsx")

    with open(main_file_path, 'w', encoding='utf-8') as file:
        file.write(code)

    with open(backup_file_path, 'w', encoding='utf-8') as file:
        file.write(code)


# 修改：获取特定用户的现有代码
def get_existing_code(user_id: str) -> str:
    file_path = Config.get_user_component_path(user_id)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            print(f"读取文件内容：{file_path}")
            return file.read()
    except FileNotFoundError:
        # 如果文件不存在，返回一个基础的React组件
        return """
import React from 'react';

export default function GeneratedComponent() {
  return (
    <div>
      <h1>Welcome to your new component!</h1>
    </div>
  );
}
"""


@app.post("/generate_jsx")
async def generate_jsx(query: Query, token: str = Depends(verify_token)):
    try:
        print(f"用户请求：{query.prompt}")
        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": query.prompt}
        ]

        if query.modify_existing:
            existing_code = get_existing_code(query.user_id)  # 修改：传入用户ID
            messages[1]["content"] = (
                f"Based on the following existing code:\n\n```tsx\n{existing_code}\n```\n\n{query.prompt},"
                f"please generate the complete TSX code block direct.")
        else:
            messages[1]["content"] = (
                f"请根据用户的 query 直接设计一个 TSX的代码进行回复，直"
                f"接输出代码即可，不要回复任何多余的文字,下面是用户的 query ：{query.prompt}"
            )

        if query.image:
            messages[1]["content"] = [
                {
                    "type": "text",
                    "text": query.prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": query.image
                    }
                }
            ]

        response = client.chat.completions.create(
            model=query.model,
            messages=messages,
            temperature=0.5,
        )

        content = response.choices[0].message.content
        print(f"模型返回内容：{content}")
        code_block = extract_code_block(content)

        if code_block:
            update_tsx_file(code_block, query.user_id)  # 修改：传入用户ID
            return {"success": True, "message": "生成成功"}
        else:
            raise HTTPException(status_code=404, detail="No JSX code block found in the response")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
