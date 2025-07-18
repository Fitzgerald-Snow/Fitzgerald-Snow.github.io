#!/usr/bin/env node

/**
 * 同步脚本：从Firebase获取thoughts数据并更新静态文件
 * 这个脚本应该定期运行以保持静态数据的更新
 * 
 * 使用方法：
 * 1. 确保已安装 firebase-admin: npm install firebase-admin
 * 2. 设置Firebase服务账户密钥
 * 3. 运行: node sync-thoughts.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase 配置（需要服务账户密钥）
// 请将您的服务账户密钥文件放在项目根目录并重命名为 firebase-service-account.json
try {
    const serviceAccount = require('./firebase-service-account.json');
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://snow-s-garage.firebaseio.com"
    });
} catch (error) {
    console.error('无法加载Firebase服务账户密钥。请确保：');
    console.error('1. 已从Firebase控制台下载服务账户密钥');
    console.error('2. 将密钥文件重命名为 firebase-service-account.json');
    console.error('3. 将文件放在项目根目录');
    process.exit(1);
}

const db = admin.firestore();

async function syncThoughts() {
    try {
        console.log('开始同步Firebase数据...');
        
        // 获取所有thoughts
        const snapshot = await db.collection('thoughts')
            .orderBy('timestamp', 'desc')
            .get();

        if (snapshot.empty) {
            console.log('Firebase中没有找到thoughts数据');
            return;
        }

        const thoughts = [];
        let index = 1;

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // 转换数据格式以适配静态使用
            const staticThought = {
                id: `static-${String(index).padStart(3, '0')}`,
                title: data.title,
                content: data.content,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                upvotes: data.upvotes || 0,
                upvotedBy: [], // 静态模式下清空个人数据
                isStatic: true
            };
            
            thoughts.push(staticThought);
            index++;
        });

        // 生成新的静态文件内容
        const fileContent = `// 静态思想数据 - 作为Firebase的备用方案
// 这个文件由sync-thoughts.js自动生成，最后更新时间: ${new Date().toISOString()}

const staticThoughts = ${JSON.stringify(thoughts, null, 4)};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = staticThoughts;
}`;

        // 写入文件
        const outputPath = path.join(__dirname, 'thoughts-static.js');
        fs.writeFileSync(outputPath, fileContent, 'utf8');
        
        console.log(`✅ 成功同步 ${thoughts.length} 条thoughts到 ${outputPath}`);
        console.log(`📅 同步时间: ${new Date().toLocaleString()}`);
        
    } catch (error) {
        console.error('❌ 同步失败:', error);
        process.exit(1);
    }
}

// 运行同步
syncThoughts().then(() => {
    console.log('同步完成，正在退出...');
    process.exit(0);
});
