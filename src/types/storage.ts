export type NodeStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'PARTITIONED' | 'REPAIRING';

export type ObjectStatus = 'HEALTHY' | 'DEGRADED' | 'REPAIRING' | 'CORRUPTED' | 'UNAVAILABLE';

export type ReplicaStatus = 'VERIFIED' | 'CORRUPTED' | 'UNKNOWN' | 'REPAIRING' | 'STALE';

export type NetworkConnectivity = 'CONNECTED' | 'DISCONNECTED' | 'TIMEOUT';

export type OperationType =
  | 'READ'
  | 'WRITE'
  | 'REPLICATE'
  | 'REPAIR'
  | 'VERIFY'
  | 'REBALANCE'
  | 'HEARTBEAT'
  | 'CORRUPT'
  | 'FAILOVER'
  | 'PARTITION'
  | 'RESTART';

export type DurabilityPolicyId = 'STANDARD' | 'HIGH_DURABILITY' | 'MAX_DURABILITY' | 'CUSTOM';

export interface DurabilityPolicy {
  id: DurabilityPolicyId;
  name: string;
  replicas: number;
  description: string;
  faultTolerance: string;
  storageOverhead: string;
}

export interface StorageNode {
  id: string;             // e.g. "node-1"
  name: string;           // e.g. "Node 01"
  rack: string;           // e.g. "rack-alpha"
  ipAddress: string;      // e.g. "10.0.1.11"
  status: NodeStatus;
  totalCapacityGB: number;
  usedCapacityGB: number;
  availableCapacityGB: number;
  storedObjectIds: string[];
  lastHeartbeat: number;  // timestamp ms
  networkConnectivity: NetworkConnectivity;
  replicaCount: number;
  activeIOPs: number;
}

export interface ObjectReplica {
  replicaId: string;
  objectId: string;
  nodeId: string;
  version: number;
  expectedChecksum: string;
  actualChecksum: string;
  status: ReplicaStatus;
  lastVerifiedAt: number;
  sizeMB: number;
}

export interface ObjectVersion {
  version: number;
  checksum: string;
  updatedAt: number;
  sizeMB: number;
  note: string;
}

export interface StorageObject {
  objectId: string;
  fileName: string;
  fileSizeMB: number;
  mimeType: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  versionsHistory: ObjectVersion[];
  checksum: string;             // Authoritative SHA-256
  replicationFactor: number;
  replicaLocations: string[];   // Node IDs where replicas live
  status: ObjectStatus;
  description: string;
  contentPreview?: string;
}

export interface SystemEvent {
  id: string;
  timestamp: number;
  operation: OperationType;
  objectId?: string;
  objectName?: string;
  nodeId?: string;
  nodeName?: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'IN_PROGRESS';
  message: string;
  details?: string;
}

export interface DecisionExplanation {
  id: string;
  timestamp: number;
  title: string;
  trigger: string;
  invariant: string;
  reasoning: string;
  action: string;
  outcome: string;
  category: 'FAILOVER' | 'SELF_HEAL' | 'CORRUPTION' | 'REBALANCE' | 'PARTITION' | 'VERSIONING';
}

export interface ClusterMetrics {
  totalObjects: number;
  totalStorageGB: number;
  usedStorageGB: number;
  activeNodes: number;
  totalNodes: number;
  replicationHealthPercent: number;
  repairOperationsCount: number;
  corruptionsDetectedCount: number;
  avgRepairTimeMs: number;
}

export interface IntegrityCheckReport {
  id: string;
  timestamp: number;
  totalObjects: number;
  totalReplicas: number;
  healthyReplicas: number;
  corruptedReplicas: number;
  missingReplicas: number;
  scanDurationMs: number;
  issues: Array<{
    objectId: string;
    fileName: string;
    nodeId: string;
    issue: string;
  }>;
}

export interface ReadTraceStep {
  nodeId: string;
  nodeName: string;
  status: 'ATTEMPTING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  latencyMs: number;
  message: string;
}

export interface ReadTraceResult {
  objectId: string;
  fileName: string;
  requestedAt: number;
  steps: ReadTraceStep[];
  success: boolean;
  servingNodeId?: string;
  servingNodeName?: string;
  failoverOccurred: boolean;
  checksumMatched: boolean;
}

export interface ActiveTransfer {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  objectId: string;
  fileName: string;
  progressPercent: number;
  transferType: 'REPLICATION' | 'REPAIR' | 'REBALANCE';
}

export interface DemoStep {
  stepNumber: number;
  stageName: string;
  title: string;
  description: string;
  whatJustHappened: string;
  systemConcept: string;
  expectedOutcome: string;
  autoActionText: string;
  focusTarget?: string;
}


