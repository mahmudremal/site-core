const { z } = require("zod");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

class FileSystemAddon {
    constructor(db, logEvent, baseDir = null) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "local-filesystem";
        this.baseDir = baseDir ? path.resolve(baseDir) : null;
    }

    _safe(p) {
        if (this.baseDir === null) {
            // No base directory restriction - use absolute path resolution
            return path.resolve(p);
        }
        
        // With base directory - ensure path is within bounds
        const resolved = path.resolve(this.baseDir, p);
        if (!resolved.startsWith(this.baseDir)) {
            throw new Error(`Access denied: Path '${p}' is outside base directory '${this.baseDir}'`);
        }
        return resolved;
    }

    _getDisplayPath(fullPath) {
        if (this.baseDir === null) {
            return fullPath;
        }
        return path.relative(this.baseDir, fullPath) || '.';
    }

    async init() {
        if (this.baseDir !== null) {
            try {
                await fs.access(this.baseDir);
            } catch (error) {
                throw new Error(`Base directory '${this.baseDir}' is not accessible: ${error.message}`);
            }
        }
        return true;
    }

    getTools() {
        return [
            {
                title: "List Directory Contents",
                name: "fs_list_directory",
                description: "List files and directories in a given folder",
                inputSchema: {
                    dirPath: z.string().default(".")
                },
                handler: async ({ dirPath }) => {
                    const fullPath = this._safe(dirPath);
                    const entries = await fs.readdir(fullPath, { withFileTypes: true });
                    return {
                        path: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        contents: entries.map(e => ({
                            name: e.name,
                            type: e.isDirectory() ? "directory" : "file"
                        }))
                    };
                }
            },
            {
                title: "Read File",
                name: "fs_read_file",
                description: "Read content of a file",
                inputSchema: {
                    filePath: z.string(),
                    encoding: z.enum(['utf8', 'ascii', 'base64', 'hex', 'binary']).default('utf8')
                },
                handler: async ({ filePath, encoding }) => {
                    const fullPath = this._safe(filePath);
                    const data = await fs.readFile(fullPath, encoding);
                    const stats = await fs.stat(fullPath);
                    return { 
                        filePath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        content: data,
                        size: stats.size,
                        encoding: encoding
                    };
                }
            },
            {
                title: "Write to File",
                name: "fs_write_file",
                description: "Write content to a file (overwrite if exists)",
                inputSchema: {
                    filePath: z.string(),
                    content: z.string(),
                    encoding: z.enum(['utf8', 'ascii', 'base64', 'hex', 'binary']).default('utf8'),
                    createDirectories: z.boolean().default(true)
                },
                handler: async ({ filePath, content, encoding, createDirectories }) => {
                    const fullPath = this._safe(filePath);
                    
                    if (createDirectories) {
                        const dir = path.dirname(fullPath);
                        await fs.mkdir(dir, { recursive: true });
                    }
                    
                    await fs.writeFile(fullPath, content, encoding);
                    const stats = await fs.stat(fullPath);
                    return { 
                        filePath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        success: true,
                        size: stats.size
                    };
                }
            },
            {
                title: "Append to File",
                name: "fs_append_file",
                description: "Append content to a file",
                inputSchema: {
                    filePath: z.string(),
                    content: z.string(),
                    encoding: z.enum(['utf8', 'ascii', 'base64', 'hex', 'binary']).default('utf8')
                },
                handler: async ({ filePath, content, encoding }) => {
                    const fullPath = this._safe(filePath);
                    await fs.appendFile(fullPath, content, encoding);
                    const stats = await fs.stat(fullPath);
                    return { 
                        filePath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        success: true,
                        size: stats.size
                    };
                }
            },
            {
                title: "Delete File",
                name: "fs_delete_file",
                description: "Delete a file",
                inputSchema: {
                    filePath: z.string(),
                    force: z.boolean().default(false)
                },
                handler: async ({ filePath, force }) => {
                    const fullPath = this._safe(filePath);
                    await fs.unlink(fullPath);
                    return { 
                        filePath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        success: true 
                    };
                }
            },
            {
                title: "Delete Directory",
                name: "fs_delete_directory",
                description: "Delete a directory and all contents",
                inputSchema: {
                    dirPath: z.string(),
                    force: z.boolean().default(true)
                },
                handler: async ({ dirPath, force }) => {
                    const fullPath = this._safe(dirPath);
                    await fs.rm(fullPath, { recursive: true, force });
                    return { 
                        dirPath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        success: true 
                    };
                }
            },
            {
                title: "Create Directory",
                name: "fs_create_directory",
                description: "Create a new directory",
                inputSchema: {
                    dirPath: z.string(),
                    recursive: z.boolean().default(true)
                },
                handler: async ({ dirPath, recursive }) => {
                    const fullPath = this._safe(dirPath);
                    await fs.mkdir(fullPath, { recursive });
                    return { 
                        dirPath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        success: true 
                    };
                }
            },
            {
                title: "Get File Info",
                name: "fs_file_info",
                description: "Retrieve information about a file or directory",
                inputSchema: {
                    filePath: z.string()
                },
                handler: async ({ filePath }) => {
                    const fullPath = this._safe(filePath);
                    const stat = await fs.stat(fullPath);
                    return {
                        filePath: this._getDisplayPath(fullPath),
                        fullPath: fullPath,
                        isFile: stat.isFile(),
                        isDirectory: stat.isDirectory(),
                        isSymbolicLink: stat.isSymbolicLink(),
                        size: stat.size,
                        created: stat.birthtime,
                        modified: stat.mtime,
                        accessed: stat.atime,
                        permissions: stat.mode.toString(8),
                        uid: stat.uid,
                        gid: stat.gid
                    };
                }
            },
            {
                title: "Scan Directory (Recursive)",
                name: "fs_scan_directory",
                description: "Recursively scan a directory for all files and folders",
                inputSchema: {
                    dirPath: z.string().default("."),
                    maxDepth: z.number().optional(),
                    includeHidden: z.boolean().default(false)
                },
                handler: async ({ dirPath, maxDepth, includeHidden }) => {
                    const startPath = this._safe(dirPath);
                    const results = [];
                    
                    async function walk(current, depth = 0) {
                        if (maxDepth !== undefined && depth > maxDepth) return;
                        
                        const items = await fs.readdir(current, { withFileTypes: true });
                        for (const item of items) {
                            if (!includeHidden && item.name.startsWith('.')) continue;
                            
                            const itemPath = path.join(current, item.name);
                            const relative = path.relative(startPath, itemPath);
                            
                            if (item.isDirectory()) {
                                results.push({ type: "directory", path: relative, depth });
                                await walk(itemPath, depth + 1);
                            } else {
                                const stats = await fs.stat(itemPath);
                                results.push({ 
                                    type: "file", 
                                    path: relative, 
                                    depth,
                                    size: stats.size,
                                    modified: stats.mtime
                                });
                            }
                        }
                    }
                    
                    await walk(startPath);
                    return { 
                        root: this._getDisplayPath(startPath),
                        fullPath: startPath,
                        entries: results,
                        totalFiles: results.filter(r => r.type === 'file').length,
                        totalDirectories: results.filter(r => r.type === 'directory').length
                    };
                }
            },
            {
                title: "Copy File",
                name: "fs_copy_file",
                description: "Copy a file from source to destination",
                inputSchema: {
                    sourcePath: z.string(),
                    destinationPath: z.string(),
                    overwrite: z.boolean().default(false)
                },
                handler: async ({ sourcePath, destinationPath, overwrite }) => {
                    const sourceFullPath = this._safe(sourcePath);
                    const destFullPath = this._safe(destinationPath);
                    
                    const flags = overwrite ? 0 : fs.constants.COPYFILE_EXCL;
                    await fs.copyFile(sourceFullPath, destFullPath, flags);
                    
                    return {
                        sourcePath: this._getDisplayPath(sourceFullPath),
                        destinationPath: this._getDisplayPath(destFullPath),
                        success: true
                    };
                }
            },
            {
                title: "Move/Rename File",
                name: "fs_move_file",
                description: "Move or rename a file",
                inputSchema: {
                    sourcePath: z.string(),
                    destinationPath: z.string()
                },
                handler: async ({ sourcePath, destinationPath }) => {
                    const sourceFullPath = this._safe(sourcePath);
                    const destFullPath = this._safe(destinationPath);
                    
                    await fs.rename(sourceFullPath, destFullPath);
                    
                    return {
                        sourcePath: this._getDisplayPath(sourceFullPath),
                        destinationPath: this._getDisplayPath(destFullPath),
                        success: true
                    };
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: "localfs://overview",
                title: "File System Overview",
                name: "Overview",
                description: "Gives the base directory and system info",
                mimeType: "application/json",
                handler: async () => {
                    const info = {
                        baseDirectory: this.baseDir,
                        currentWorkingDirectory: process.cwd(),
                        homeDirectory: os.homedir(),
                        tempDirectory: os.tmpdir(),
                        platform: os.platform(),
                        hasBaseDirectoryRestriction: this.baseDir !== null
                    };
                    
                    // Try to get disk space info
                    try {
                        const targetDir = this.baseDir || process.cwd();
                        const stats = await fs.statfs(targetDir);
                        info.diskSpace = {
                            total: stats.bavail * stats.bsize,
                            free: stats.bfree * stats.bsize,
                            used: (stats.blocks - stats.bfree) * stats.bsize
                        };
                    } catch (error) {
                        info.diskSpace = { error: "Could not retrieve disk space info" };
                    }
                    
                    return { content: JSON.stringify(info, null, 2) };
                }
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: "File System Assistant",
                name: "filesystem_assistant",
                description: "Get help with file system operations",
                arguments: [
                    {
                        name: "task",
                        description: "Describe file operation required",
                        required: false
                    }
                ],
                handler: async (args) => {
                    const baseInfo = this.baseDir 
                        ? `Operating within base directory: ${this.baseDir}`
                        : "Operating with full file system access";
                        
                    return {
                        description: `File System Assistant - ${baseInfo}`,
                        messages: [
                            {
                                role: "user",
                                content: {
                                    type: "text",
                                    text: `I can help manage your files and folders. ${baseInfo}. Available operations: read, write, list, copy, move, delete files and directories.`
                                }
                            }
                        ]
                    };
                }
            }
        ];
    }
}

module.exports = FileSystemAddon;