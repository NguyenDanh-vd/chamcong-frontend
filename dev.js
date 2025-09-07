const { spawn } = require('child_process');
const os = require('os');

// Lấy IP LAN chính (adapter đang dùng, IPv4, không internal)
function getPrimaryIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Trả IP đầu tiên hợp lệ
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const lanIP = getPrimaryIP();
console.log(`Network: http://${lanIP}:3001`);

// Chạy Next.js dev server
const next = spawn(
  'node',
  ['-r', 'ts-node/register', 'node_modules/next/dist/bin/next', 'dev', '-H', '0.0.0.0', '-p', '3001'],
  { stdio: 'inherit' }
);

next.on('close', (code) => {
  console.log(`Next.js exited with code ${code}`);
});
