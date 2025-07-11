const { z } = require("zod");
// const { FigmaService } = require("./figma");

class FigmaAddon {
  constructor(db, logEvent) {
    this.db = db;
    this.logEvent = logEvent;
    const figmaApiKey = null;
    const figmaOAuthToken = null;
    const useOAuth = null;
    this.name = "figma";
    // this.service = new FigmaService({ figmaApiKey, figmaOAuthToken, useOAuth });
  }

  async init() {
    return true;
  }

  getTools() {
    return [
      {
        title: "Get Figma File",
        name: "figma_get_file",
        description: "Retrieve and simplify full Figma file data",
        inputSchema: {
          fileKey: z.string(),
          depth: z.number().int().optional()
        },
        handler: async ({ fileKey, depth }) => {
          const design = await this.service.getFile(fileKey, depth ?? null);
          return { design };
        }
      },
      {
        title: "Get Node from File",
        name: "figma_get_node",
        description: "Retrieve and simplify a node from a Figma file",
        inputSchema: {
          fileKey: z.string(),
          nodeId: z.string(),
          depth: z.number().int().optional()
        },
        handler: async ({ fileKey, nodeId, depth }) => {
          const design = await this.service.getNode(fileKey, nodeId, depth ?? null);
          return { design };
        }
      },
      {
        title: "Download Images for Nodes",
        name: "figma_download_images",
        description: "Download image fills and renders from nodes",
        inputSchema: {
          fileKey: z.string(),
          nodes: z.array(z.object({
            nodeId: z.string(),
            fileName: z.string(),
            fileType: z.enum(["png", "svg"]),
            imageRef: z.string().optional(),
          })),
          localPath: z.string(),
          pngScale: z.number().optional().default(1),
          svgOptions: z.object({
            outlineText: z.boolean().optional().default(false),
            includeId: z.boolean().optional().default(false),
            simplifyStroke: z.boolean().optional().default(false),
          }).optional()
        },
        handler: async ({ fileKey, nodes, localPath, pngScale, svgOptions }) => {
          // Separate image fills and render nodes
          const imageFills = nodes.filter(n => n.imageRef);
          const renderNodes = nodes.filter(n => !n.imageRef);

          const fillFiles = await this.service.getImageFills(fileKey, imageFills.map(({ nodeId, fileName, imageRef }) => ({ nodeId, fileName, imageRef })), localPath);
          const imageFiles = await this.service.getImages(
            fileKey,
            renderNodes.map(({ nodeId, fileName, fileType }) => ({ nodeId, fileName, fileType })),
            localPath,
            pngScale,
            svgOptions || { outlineText: false, includeId: false, simplifyStroke: false }
          );

          return { downloadedFiles: [...fillFiles, ...imageFiles].filter(Boolean) };
        }
      }
    ];
  }

  getResources() {
    return [];
  }

  getPrompts() {
    return [
      {
        title: "Figma Assistant",
        name: "figma_assistant",
        description: "Assist with querying and downloading Figma file and node data",
        arguments: [
          {
            name: "help_topic",
            description: "Describe how you want to use the Figma integration",
            required: false
          }
        ],
        handler: async () => ({
          description:
            "I can fetch Figma files, get nodes from files, and download images or vector renders from nodes with full simplified design metadata.",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Ask me to fetch Figma files, nodes or download images for design automation."
              }
            }
          ]
        })
      }
    ];
  }
}

module.exports = FigmaAddon;