# GenUI - AI驱动的界面生成系统

## 项目介绍
GenUI 是一个基于 AI 的智能界面生成系统，能够通过自然语言描述自动生成 React 组件。系统采用 FastAPI 和 React 技术栈开发，支持实时预览和代码生成。

## 主要特性
- 🤖 AI 驱动的界面生成
- 🎨 支持多种 UI 组件库
- 🔄 实时预览和代码更新
- 📱 响应式设计支持
- 🎯 精准的代码生成
- 🔒 安全的用户隔离

## 技术栈
### 后端
- FastAPI
- OpenAI API
- Python 3.8+

### 前端
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Framer Motion

## 快速开始

### 后端设置
1. 克隆仓库
```bash
git clone https://github.com/yourusername/genui.git
cd genui
```
2. 安装依赖
```bash
pip install fastapi openai uvicorn python-dotenv
```
3. 在 config.py 中配置 API 密钥和基础 URL
4. 启动服务
```bash
python main.py
```

### 前端设置
1. 进入 /website 目录
```bash
cd website
```
2. 安装依赖
```bash
npm install
```
3. 启动前端
```bash
npm run dev
```

## 注意事项

1. 确保正确配置 OpenAI API 密钥
2. 建议使用 Node.js 16+ 版本
3. 确保后端服务器正常运行后再启动前端
4. 定期清理备份文件夹


## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License

