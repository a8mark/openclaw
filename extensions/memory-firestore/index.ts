/**
 * OpenClaw Memory (Firestore) Plugin
 *
 * Shared long-term memory with vector search using Google Cloud Firestore.
 * Supports cross-instance context (gpumonster, guppy, phoneclaw)
 * and user-based isolation.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform";
import { Firestore, FieldValue, VectorValue } from "@google-cloud/firestore";
import { Type } from "@sinclair/typebox";
import { randomUUID } from "node:crypto";

// ============================================================================
// Schema & Types
// ============================================================================

const memoryConfigSchema = Type.Object({
  projectId: Type.String({ description: "GCP Project ID" }),
  location: Type.Optional(Type.String({ default: "us-central1" })),
  collectionName: Type.Optional(Type.String({ default: "autumn-memories" })),
  keyFilePath: Type.Optional(Type.String({ description: "Path to GCP service account key JSON" })),
  autoRecall: Type.Optional(Type.Boolean({ default: true })),
  autoCapture: Type.Optional(Type.Boolean({ default: true })),
});

type MemoryConfig = {
  projectId: string;
  location: string;
  collectionName: string;
  keyFilePath?: string;
  autoRecall: boolean;
  autoCapture: boolean;
};

// ============================================================================
// Vertex AI Embeddings
// ============================================================================

class VertexEmbeddings {
  private client: PredictionServiceClient;
  private endpoint: string;

  constructor(projectId: string, location: string, keyFilePath?: string) {
    const opts: any = { apiEndpoint: `${location}-aiplatform.googleapis.com` };
    if (keyFilePath) opts.keyFilename = keyFilePath;
    this.client = new PredictionServiceClient(opts);
    this.endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004`;
  }

  async embed(text: string): Promise<number[]> {
    const instance = helpers.toValue({ content: text });
    const [response] = await this.client.predict({
      endpoint: this.endpoint,
      instances: [instance!],
    });

    const predictions = response.predictions as any[];
    return predictions[0].structValue.fields.embeddings.structValue.fields.values.listValue.values.map(
      (v: any) => v.numberValue,
    );
  }
}

type MemoryEntry = {
  id: string;
  userId: string;
  text: string;
  vector: number[];
  category: string;
  importance: number;
  createdAt: any;
};

// ============================================================================
// Firestore Provider
// ============================================================================

class FirestoreMemory {
  private db: Firestore;
  private collection: string;

  constructor(projectId: string, collection: string, keyFilePath?: string) {
    const opts: any = { projectId };
    if (keyFilePath) opts.keyFilename = keyFilePath;
    this.db = new Firestore(opts);
    this.collection = collection;
  }

  async store(entry: Omit<MemoryEntry, "id" | "createdAt">): Promise<string> {
    const id = randomUUID();
    const docRef = this.db.collection(this.collection).doc(id);

    await docRef.set({
      ...entry,
      id,
      // Convert raw array to Firestore VectorValue
      vector: new VectorValue(entry.vector),
      createdAt: FieldValue.serverTimestamp(),
    });

    return id;
  }

  async search(params: {
    userId: string;
    vector: number[];
    limit?: number;
    minScore?: number;
  }): Promise<any[]> {
    const { userId, vector, limit = 5 } = params;

    // Perform vector search with userId filter
    const query = this.db
      .collection(this.collection)
      .where("userId", "==", userId)
      .findNearest("vector", new VectorValue(vector), {
        limit,
        distanceMeasure: "COSINE",
      });

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      score: 1, // Firestore doesn't return raw scores in findNearest yet
    }));
  }
}

// ============================================================================
// Plugin Registration
// ============================================================================

const firestorePlugin = {
  id: "memory-firestore",
  name: "Memory (Firestore)",
  description: "GCP Firestore-backed long-term memory",
  kind: "memory" as const,
  configSchema: memoryConfigSchema,

  register(api: OpenClawPluginApi) {
    const cfg = api.pluginConfig as unknown as MemoryConfig;
    const db = new FirestoreMemory(cfg.projectId, cfg.collectionName, cfg.keyFilePath);
    const embeddings = new VertexEmbeddings(
      cfg.projectId,
      cfg.location || "us-central1",
      cfg.keyFilePath,
    );

    api.logger.info(`memory-firestore: registered for project ${cfg.projectId} using Vertex AI`);

    // TOOL: Memory Store
    api.registerTool(
      {
        name: "memory_store",
        label: "Memory Store (Firestore)",
        description: "Save information to Autumn's shared memory. Bounded by user.",
        parameters: Type.Object({
          text: Type.String(),
          userId: Type.String({ description: "Target user ID for this memory" }),
          category: Type.Optional(Type.String()),
          importance: Type.Optional(Type.Number()),
        }),
        async execute(_id, params: any) {
          const vector = await embeddings.embed(params.text);

          const entryId = await db.store({
            userId: params.userId,
            text: params.text,
            vector,
            category: params.category || "general",
            importance: params.importance || 0.7,
          });

          return { content: [{ type: "text", text: `Stored in cloud memory (ID: ${entryId})` }] };
        },
      },
      { name: "memory_store" },
    );

    // TOOL: Memory Recall
    api.registerTool(
      {
        name: "memory_recall",
        label: "Memory Recall (Firestore)",
        description: "Search shared memory for a specific user.",
        parameters: Type.Object({
          query: Type.String(),
          userId: Type.String(),
          limit: Type.Optional(Type.Number()),
        }),
        async execute(_id, params: any) {
          const vector = await embeddings.embed(params.query);

          const results = await db.search({
            userId: params.userId,
            vector,
            limit: params.limit,
          });

          if (results.length === 0)
            return { content: [{ type: "text", text: "No relevant memories found." }] };

          const text = results.map((r, i) => `${i + 1}. [${r.category}] ${r.text}`).join("\n");
          return { content: [{ type: "text", text: `Recalled memories:\n\n${text}` }] };
        },
      },
      { name: "memory_recall" },
    );
  },
};

export default firestorePlugin;
