import { ApiResponse } from "@/server/utils/api-response";
import { BlockchainService } from "@/server/services/blockchain.service";
import { Logger } from "@/server/services/logger.service";

export async function GET() {
  try {
    const blockchainService = new BlockchainService();
    const [rpcHealthy, ledgerHealth] = await Promise.all([
      blockchainService.isHealthy(),
      blockchainService.getLedgerHealth(),
    ]);
    const degraded = ledgerHealth.ledgerAgeSeconds > 60;

    return ApiResponse.success(
      {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        ledger: ledgerHealth.ledger,
        ledgerAgeSeconds: ledgerHealth.ledgerAgeSeconds,
        status: !rpcHealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      },
      !rpcHealthy
        ? "System is unhealthy"
        : degraded
          ? "System is degraded"
          : "System is healthy",
    );
  } catch (error) {
    Logger.error("Health check failed", { error: String(error) });
    return ApiResponse.error("Health check failed", 500);
  }
}
