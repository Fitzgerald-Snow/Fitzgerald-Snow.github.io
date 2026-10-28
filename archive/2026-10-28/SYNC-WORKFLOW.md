# 自动同步工作流程

## 定期更新静态数据的步骤：

### 1. 手动同步（适合偶尔更新）
```bash
# 在项目目录下运行
npm run sync-thoughts
```

### 2. 定期同步（推荐设置）
可以设置cron任务或使用GitHub Actions自动化：

#### 本地cron设置（Mac/Linux）：
```bash
# 编辑crontab
crontab -e

# 添加以下行（每天凌晨2点同步）
0 2 * * * cd /Users/fitzgeraldsnow/Desktop/website/PrinceAesthetic.github.io && npm run sync-thoughts

# 或者每6小时同步一次
0 */6 * * * cd /Users/fitzgeraldsnow/Desktop/website/PrinceAesthetic.github.io && npm run sync-thoughts
```

#### GitHub Actions自动化（推荐）：
创建 `.github/workflows/sync-thoughts.yml` 文件，实现自动同步和部署。

### 3. 同步后提交更新
```bash
# 同步完成后，提交更新的静态文件
git add thoughts-static.js
git commit -m "更新静态思想数据 - $(date)"
git push
```

## 文件说明：
- `firebase-service-account.json` - Firebase服务账户密钥（不会被提交到Git）
- `thoughts-static.js` - 自动生成的静态数据文件（会被提交到Git）
- `sync-thoughts.js` - 同步脚本（已提交到Git）

## 安全提醒：
- ✅ `thoughts-static.js` 可以公开（不包含敏感信息）
- ❌ `firebase-service-account.json` 绝不能公开（包含私钥）
- ❌ 已在 .gitignore 中排除服务账户密钥文件
