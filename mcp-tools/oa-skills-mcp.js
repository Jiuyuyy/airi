#!/usr/bin/env node

/**
 * oa-skills MCP Server (Stdio 模式)
 *
 * 将 oa-skills CLI 包装成 MCP Server，供 AIRI 调用
 *
 * 使用方法:
 *   {
 *     "mcpServers": {
 *       "citadel": {
 *         "command": "node",
 *         "args": ["/path/to/this/script.js"],
 *         "enabled": true
 *       }
 *     }
 *   }
 */

const { spawn } = require('node:child_process')

const OASKILLS_BIN = '/Users/jiuyuy/Projects/person/airi/mcp-tools/node_modules/.bin/oa-skills'

// 工具列表
const tools = [
  {
    name: 'get_collaboration_markdown_by_sso',
    description: '获取学城文档的 Markdown 格式内容',
    inputSchema: {
      type: 'object',
      properties: {
        contentId: { type: 'string', description: '学城文档的 contentId' },
      },
      required: ['contentId'],
    },
  },
  {
    name: 'get_child_content_by_sso',
    description: '获取学城子文档列表',
    inputSchema: {
      type: 'object',
      properties: {
        contentId: { type: 'string', description: '学城文档的 contentId' },
      },
      required: ['contentId'],
    },
  },
  {
    name: 'add_collaboration_content_by_sso',
    description: '创建新学城文档（Markdown 格式）',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '文档标题' },
        content: { type: 'string', description: 'Markdown 内容' },
        parentId: { type: 'string', description: '父文档 ID（可选）' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'listTools',
    description: '列出所有可用工具',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

// 请求 ID 计数器
const id = 0

function sendResponse(id, result) {
  process.stdout.write(`${JSON.stringify({
    jsonrpc: '2.0',
    id,
    result,
  })}\n`)
}

function sendError(id, code, message) {
  process.stdout.write(`${JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message },
  })}\n`)
}

// 处理请求
async function handleRequest(request) {
  const { id: reqId, method, params } = request

  if (method === 'initialize') {
    sendResponse(reqId, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: 'oa-skills-mcp',
        version: '1.0.0',
      },
    })
    return
  }

  if (method === 'notifications/initialized') {
    return
  }

  if (method === 'tools/list') {
    sendResponse(reqId, { tools })
    return
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params

    try {
      const result = await callTool(name, args)
      sendResponse(reqId, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      })
    }
    catch (e) {
      sendError(reqId, -32603, e.message)
    }
    return
  }

  sendError(reqId, -32601, `Unknown method: ${method}`)
}

// 调用 oa-skills CLI
function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const cmd = OASKILLS_BIN
    const cliArgs = ['citadel']

    switch (toolName) {
      case 'get_collaboration_markdown_by_sso':
        cliArgs.push('getMarkdown', '--contentId', args.contentId)
        break
      case 'get_child_content_by_sso':
        cliArgs.push('getChildContent', '--contentId', args.contentId)
        break
      case 'add_collaboration_content_by_sso':
        cliArgs.push('createDocument')
        if (args.title)
          cliArgs.push('--title', args.title)
        if (args.content)
          cliArgs.push('--markdown', args.content)
        if (args.parentId)
          cliArgs.push('--parentId', args.parentId)
        break
      case 'listTools':
        resolve(tools.map(t => t.name).join('\n'))
        return
      default:
        reject(new Error(`Unknown tool: ${toolName}`))
        return
    }

    const proc = spawn(cmd, cliArgs, {
      env: { ...process.env },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        // 解析输出，提取 JSON
        try {
          // 尝试找到 JSON 输出
          const jsonMatch = stdout.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]))
          }
          else {
            resolve(stdout.trim())
          }
        }
        catch (e) {
          resolve(stdout.trim())
        }
      }
      else {
        reject(new Error(stderr || `Command failed with code ${code}`))
      }
    })

    proc.on('error', (e) => {
      reject(e)
    })
  })
}

// 主循环：读取 stdin
let buffer = ''

process.stdin.setEncoding('utf-8')

process.stdin.on('data', (chunk) => {
  buffer += chunk
  const lines = buffer.split('\n')
  buffer = lines.pop() || ''

  for (const line of lines) {
    if (line.trim()) {
      try {
        const request = JSON.parse(line)
        handleRequest(request)
      }
      catch (e) {
        console.error('Parse error:', e.message)
      }
    }
  }
})

process.stdin.on('end', () => {
  process.exit(0)
})

console.error('[oa-skills-mcp] Starting...')
