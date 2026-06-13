import { createApp, lakebase, serving, server } from '@databricks/appkit';
import { setupBenefitsRoutes } from './routes/benefits';
import { setupChatRoute } from './routes/chat';
import { setupExplainRoute } from './routes/explain';
import { setupCatalogRoute } from './routes/catalog';
import { setupApplyRoute } from './routes/apply';
import { ensureImpactSeeded } from './routes/impact_seed';

createApp({
  plugins: [
    lakebase(),
    // 'default' = the chat LLM; 'embed' = the embedding model for semantic RAG retrieval.
    serving({
      endpoints: {
        default: { env: 'DATABRICKS_SERVING_ENDPOINT_NAME' },
        embed: { env: 'DATABRICKS_EMBEDDING_ENDPOINT_NAME' },
      },
    }),
    server(),
  ],
  async onPluginsReady(appkit) {
    await setupBenefitsRoutes(appkit);
    setupChatRoute(appkit);
    setupExplainRoute(appkit);
    setupCatalogRoute(appkit);
    setupApplyRoute(appkit);
    await ensureImpactSeeded(appkit);
  },
}).catch(console.error);
