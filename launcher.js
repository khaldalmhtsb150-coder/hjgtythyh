const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SkillSparkHub Bot & Dashboard...\n');

let botProcess = null;
let dashboardProcess = null;
let shuttingDown = false;

function startBot() {
    console.log('Starting Discord bot...');
    botProcess = spawn('node', ['index.js'], {
        stdio: 'inherit',
        cwd: __dirname
    });

    botProcess.on('error', (error) => {
        console.error('❌ Bot process error:', error);
    });

    botProcess.on('exit', (code) => {
        console.log(`🔴 Bot process exited with code ${code}`);
        if (!shuttingDown && code !== 0) {
            console.log('⚠️  Bot crashed. Dashboard will continue running.');
        }
        botProcess = null;
    });
}

function startDashboard() {
    console.log('Starting Flask dashboard...');
    dashboardProcess = spawn('python', ['-m', 'flask', 'run', '--host=0.0.0.0', '--port=5000'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, 'dashboard'),
        env: {
            ...process.env,
            FLASK_APP: 'main.py',
            PYTHONUNBUFFERED: '1'
        }
    });

    dashboardProcess.on('error', (error) => {
        console.error('❌ Dashboard process error:', error);
    });

    dashboardProcess.on('exit', (code) => {
        console.log(`🔴 Dashboard process exited with code ${code}`);
        if (!shuttingDown && code !== 0) {
            console.log('⚠️  Dashboard crashed. Restarting in 5 seconds...');
            setTimeout(startDashboard, 5000);
        }
        dashboardProcess = null;
    });
}

function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    
    console.log('\n⚠️  Shutting down...');
    
    if (botProcess) {
        botProcess.kill('SIGTERM');
    }
    if (dashboardProcess) {
        dashboardProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startBot();
setTimeout(startDashboard, 2000);
