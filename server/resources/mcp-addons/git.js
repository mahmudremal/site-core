const { exec } = require("child_process");
const { z } = require("zod");

class GitAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        const repoPath = process.cwd();
        this.name = "git-manager";
        this.repoPath = repoPath;
    }

    async _execGit(command) {
        return new Promise((resolve, reject) => {
            exec(`git ${command}`, { cwd: this.repoPath }, (error, stdout, stderr) => {
                if (error) reject(stderr || error.message);
                else resolve(stdout.trim());
            });
        });
    }

    async init() {
        await this._execGit("status");
        return true;
    }

    getTools() {
        return [
            {
                title: "Git Status",
                name: "status",
                description: "Show git status",
                inputSchema: {},
                handler: async () => {
                    const output = await this._execGit("status --short");
                    return { status: output };
                }
            },
            {
                title: "Git Log",
                name: "log",
                description: "Show git commit logs",
                inputSchema: {
                    maxCount: z.number().optional()
                },
                handler: async ({ maxCount }) => {
                    const count = maxCount ? `-n ${maxCount}` : "";
                    const output = await this._execGit(`log ${count} --pretty=format:"%h %an %ad %s" --date=short`);
                    return { log: output };
                }
            },
            {
                title: "Git Add",
                name: "add",
                description: "Add file(s) to staging",
                inputSchema: {
                    files: z.array(z.string()).nonempty()
                },
                handler: async ({ files }) => {
                    const output = await this._execGit(`add ${files.map(f=>`"${f}"`).join(" ")}`);
                    return { success: true };
                }
            },
            {
                title: "Git Commit",
                name: "commit",
                description: "Commit staged changes",
                inputSchema: {
                    message: z.string()
                },
                handler: async ({ message }) => {
                    const output = await this._execGit(`commit -m "${message.replace(/"/g, '\\"')}"`);
                    return { commit: output };
                }
            },
            {
                title: "Git Push",
                name: "push",
                description: "Push commits to remote",
                inputSchema: {
                    remote: z.string().default("origin"),
                    branch: z.string().default("main")
                },
                handler: async ({ remote, branch }) => {
                    const output = await this._execGit(`push ${remote} ${branch}`);
                    return { push: output };
                }
            },
            {
                title: "Git Pull",
                name: "pull",
                description: "Pull updates from remote",
                inputSchema: {
                    remote: z.string().default("origin"),
                    branch: z.string().default("main")
                },
                handler: async ({ remote, branch }) => {
                    const output = await this._execGit(`pull ${remote} ${branch}`);
                    return { pull: output };
                }
            },
            {
                title: "Git Branch List",
                name: "branch_list",
                description: "List all branches",
                inputSchema: {},
                handler: async () => {
                    const output = await this._execGit("branch --list");
                    return { branches: output.split("\n").map(b => b.trim()) };
                }
            },
            {
                title: "Git Checkout",
                name: "checkout",
                description: "Checkout a branch or commit",
                inputSchema: {
                    ref: z.string()
                },
                handler: async ({ ref }) => {
                    const output = await this._execGit(`checkout ${ref}`);
                    return { checkout: output };
                }
            },
            {
                title: "Git Diff",
                name: "diff",
                description: "Show changes",
                inputSchema: {
                    cached: z.boolean().optional()
                },
                handler: async ({ cached }) => {
                    const cmd = cached ? "diff --cached" : "diff";
                    const output = await this._execGit(cmd);
                    return { diff: output || "No changes" };
                }
            },
            {
                title: "Git Remote List",
                name: "remote_list",
                description: "List git remotes",
                inputSchema: {},
                handler: async () => {
                    const output = await this._execGit("remote -v");
                    return { remotes: output };
                }
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [];
    }
}

module.exports = GitAddon;