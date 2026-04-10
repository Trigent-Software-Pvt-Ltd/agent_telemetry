module.exports = {
  apps: [{
    name: 'agent-telemetry',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/ec2-user/agent_telemetry',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_file: '.env.production',
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/var/log/agent-telemetry/error.log',
    out_file: '/var/log/agent-telemetry/out.log',
    merge_logs: true,
  }]
}
