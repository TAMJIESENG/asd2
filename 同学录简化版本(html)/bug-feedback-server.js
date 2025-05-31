const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 确保bug反馈目录存在
const bugReportsDir = path.join(__dirname, 'bug-reports');
if (!fs.existsSync(bugReportsDir)) {
    fs.mkdirSync(bugReportsDir);
}

// 接收bug反馈的API
app.post('/api/bug-report', (req, res) => {
    try {
        const { title, description, userEmail, userAgent, timestamp, severity, category } = req.body;
        
        // 验证必填字段
        if (!title || !description) {
            return res.status(400).json({ 
                success: false, 
                message: '标题和描述为必填项' 
            });
        }
        
        // 生成唯一的bug报告ID
        const bugId = 'BUG_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 创建bug报告对象
        const bugReport = {
            id: bugId,
            title: title.trim(),
            description: description.trim(),
            userEmail: userEmail || '匿名用户',
            userAgent: userAgent || 'Unknown',
            timestamp: timestamp || new Date().toISOString(),
            severity: severity || 'medium',
            category: category || 'general',
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // 保存到文件
        const fileName = `${bugId}.json`;
        const filePath = path.join(bugReportsDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(bugReport, null, 2), 'utf8');
        
        // 更新bug报告列表
        updateBugReportsList();
        
        console.log(`📝 新的bug报告已收到: ${bugId}`);
        console.log(`标题: ${title}`);
        console.log(`用户: ${userEmail || '匿名'}`);
        console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
        console.log('---');
        
        res.json({ 
            success: true, 
            message: 'Bug报告已成功提交',
            bugId: bugId
        });
        
    } catch (error) {
        console.error('处理bug报告时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 获取所有bug报告列表
app.get('/api/bug-reports', (req, res) => {
    try {
        const reportsListPath = path.join(bugReportsDir, 'reports-list.json');
        
        if (fs.existsSync(reportsListPath)) {
            const reportsList = JSON.parse(fs.readFileSync(reportsListPath, 'utf8'));
            res.json({ success: true, reports: reportsList });
        } else {
            res.json({ success: true, reports: [] });
        }
    } catch (error) {
        console.error('获取bug报告列表时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取报告列表失败' 
        });
    }
});

// 获取单个bug报告详情
app.get('/api/bug-report/:id', (req, res) => {
    try {
        const bugId = req.params.id;
        const filePath = path.join(bugReportsDir, `${bugId}.json`);
        
        if (fs.existsSync(filePath)) {
            const bugReport = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            res.json({ success: true, report: bugReport });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Bug报告未找到' 
            });
        }
    } catch (error) {
        console.error('获取bug报告详情时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取报告详情失败' 
        });
    }
});

// 更新bug报告状态
app.put('/api/bug-report/:id/status', (req, res) => {
    try {
        const bugId = req.params.id;
        const { status } = req.body;
        const filePath = path.join(bugReportsDir, `${bugId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bug报告未找到' 
            });
        }
        
        const bugReport = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        bugReport.status = status;
        bugReport.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(bugReport, null, 2), 'utf8');
        updateBugReportsList();
        
        res.json({ 
            success: true, 
            message: '状态更新成功' 
        });
        
    } catch (error) {
        console.error('更新bug报告状态时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '状态更新失败' 
        });
    }
});

// 更新bug报告列表文件
function updateBugReportsList() {
    try {
        const files = fs.readdirSync(bugReportsDir)
            .filter(file => file.endsWith('.json') && file !== 'reports-list.json')
            .map(file => {
                const filePath = path.join(bugReportsDir, file);
                const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    id: report.id,
                    title: report.title,
                    severity: report.severity,
                    category: report.category,
                    status: report.status,
                    userEmail: report.userEmail,
                    createdAt: report.createdAt,
                    updatedAt: report.updatedAt
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const reportsListPath = path.join(bugReportsDir, 'reports-list.json');
        fs.writeFileSync(reportsListPath, JSON.stringify(reports, null, 2), 'utf8');
        
    } catch (error) {
        console.error('更新bug报告列表时出错:', error);
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Bug反馈后台服务器已启动`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📁 Bug报告保存目录: ${bugReportsDir}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('---');
    console.log('📋 可用的API端点:');
    console.log('  POST /api/bug-report - 提交bug报告');
    console.log('  GET  /api/bug-reports - 获取所有bug报告');
    console.log('  GET  /api/bug-report/:id - 获取单个bug报告');
    console.log('  PUT  /api/bug-report/:id/status - 更新bug状态');
    console.log('===================================');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭Bug反馈服务器...');
    process.exit(0);
});