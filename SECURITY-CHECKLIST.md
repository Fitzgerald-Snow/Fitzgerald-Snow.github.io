# 🔒 Firebase密钥安全检查清单

## ✅ 当前已配置的安全措施：

1. **`.gitignore` 文件已正确配置**
   - `firebase-service-account.json` 已被排除
   - Git不会跟踪此文件

2. **验证命令确认**
   ```bash
   git check-ignore firebase-service-account.json
   # 输出: firebase-service-account.json (表示被忽略)
   ```

## 🛡️ 额外安全建议：

### 1. 定期检查
```bash
# 提交前务必检查，确保密钥文件不在列表中
git status

# 或者使用更详细的检查
git ls-files | grep firebase
# 应该没有任何输出
```

### 2. 如果意外提交了密钥文件
```bash
# 立即从Git历史中移除（注意：这会改变提交历史）
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch firebase-service-account.json' \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送更新远程仓库
git push origin --force --all
```

### 3. 预提交钩子（可选）
创建 `.git/hooks/pre-commit` 文件来自动检查：
```bash
#!/bin/sh
if git ls-files | grep -q firebase-service-account.json; then
    echo "❌ 错误: Firebase密钥文件不能提交！"
    exit 1
fi
```

### 4. 备用方案
- 定期备份密钥文件到安全位置
- 记录密钥的获取步骤以便重新生成

## ⚠️ 重要提醒：
- ✅ 可以安全提交: `thoughts-static.js`（不含敏感信息）
- ❌ 绝不能提交: `firebase-service-account.json`（包含私钥）
- ✅ 可以安全提交: `sync-thoughts.js`（只是代码逻辑）
