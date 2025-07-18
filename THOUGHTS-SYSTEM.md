# Thought Cabinet - 混合访问系统

这个系统支持两种访问模式，确保所有用户都能访问内容：

## 🌐 完整模式（Firebase）
- **适用于**：海外用户或有VPN的用户
- **功能**：完整的交互功能
  - 查看所有思想内容
  - 点赞和互动
  - 管理员可以添加、编辑、删除内容
  - 实时数据同步

## 📖 阅读模式（静态内容）
- **适用于**：国内用户或Firebase访问受限的用户
- **功能**：只读访问
  - 查看缓存的思想内容
  - 无法点赞或互动
  - 管理员功能不可用
  - 显示"阅读模式"状态提示

## 🔄 自动切换机制

系统会自动检测Firebase连接状态：

1. **优先尝试Firebase连接**（5秒超时）
2. **连接成功** → 使用完整模式
3. **连接失败** → 自动切换到阅读模式
4. **状态提示** → 用户会看到相应的连接状态提示

## 📱 用户体验

### 完整模式用户看到

- ✅ 正常的思想页面，无额外提示
- ✅ 所有交互按钮可用
- ✅ 实时数据更新
- ✅ 界面简洁，无多余状态提示

### 阅读模式用户看到

- 📖 "Reading mode" 黄色提示
- 点赞按钮显示为灰色且不可点击
- "Interactions unavailable in reading mode" 提示
- 管理员按钮会提示网络连接问题

## ⚙️ 维护指南

### 更新静态内容

为了让阅读模式用户看到最新内容，需要定期同步Firebase数据到静态文件：

1. **设置Firebase服务账户**：
   ```bash
   # 从Firebase控制台下载服务账户密钥
   # 重命名为 firebase-service-account.json
   # 放在项目根目录
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **运行同步脚本**：
   ```bash
   npm run sync-thoughts
   ```

4. **部署更新**：
   ```bash
   git add thoughts-static.js
   git commit -m "更新静态思想数据"
   git push
   ```

### 自动化同步（推荐）

可以设置GitHub Actions或其他CI/CD工具定期运行同步脚本：

```yaml
# .github/workflows/sync-thoughts.yml
name: Sync Thoughts Data
on:
  schedule:
    - cron: '0 */6 * * *'  # 每6小时运行一次
  workflow_dispatch:  # 允许手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync-thoughts
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add thoughts-static.js
          git commit -m "自动更新静态思想数据" || exit 0
          git push
```

## 🔧 技术实现

### 连接检测逻辑
- 使用匿名Firebase认证测试连接
- 尝试读取一条Firestore数据验证访问
- 5秒超时机制防止长时间等待

### 降级策略
- Firebase失败时自动加载本地 `thoughts-static.js`
- 保持相同的UI结构，只禁用交互功能
- 明确的状态提示告知用户当前模式

### 数据同步
- 使用Firebase Admin SDK获取最新数据
- 自动生成格式化的静态文件
- 保持数据结构一致性

这个解决方案确保了：
- ✅ 国内用户可以访问内容
- ✅ 海外用户享受完整功能
- ✅ 自动适应网络环境
- ✅ 用户体验友好
- ✅ 维护简单
