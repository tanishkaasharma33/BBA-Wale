/**
 * VAULT Distributed Storage Engine & Simulation Controller
 * Authoritative state management for nodes, objects, replicas, failure detection, and self-healing.
 */

import {
  StorageNode,
  StorageObject,
  ObjectReplica,
  SystemEvent,
  DecisionExplanation,
  ClusterMetrics,
  IntegrityCheckReport,
  DurabilityPolicyId,
  OperationType,
  ActiveTransfer,
  ReadTraceResult,
  ReadTraceStep,
} from '../types/storage';
import { getInitialNodes, getInitialObjects, DURABILITY_POLICIES } from '../data/initialData';
import { generateChecksum, corruptChecksumString } from '../utils/crypto';

export interface VaultState {
  nodes: StorageNode[];
  objects: StorageObject[];
  replicas: ObjectReplica[];
  events: SystemEvent[];
  explanations: DecisionExplanation[];
  selectedPolicy: DurabilityPolicyId;
  replicationFactor: number;
  isAutoRepairEnabled: boolean;
  activeOperation: string | null;
  metrics: ClusterMetrics;
  lastIntegrityReport: IntegrityCheckReport | null;
  activeTransfers: ActiveTransfer[];
}


const STORAGE_KEY = 'vault_distributed_state_v1';

class VaultEngine {
  private state: VaultState;
  private listeners: Set<(state: VaultState) => void> = new Set();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isProcessingRepair: boolean = false;

  constructor() {
    this.state = this.loadInitialState();
    this.startHeartbeatLoop();
  }

  private loadInitialState(): VaultState {
    const defaultData = this.buildFreshData();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic schema guard
        if (parsed.nodes && parsed.objects && parsed.replicas) {
          // Refresh timestamps so they look active
          const now = Date.now();
          parsed.nodes = parsed.nodes.map((n: StorageNode) => ({
            ...n,
            lastHeartbeat: n.status === 'HEALTHY' || n.status === 'DEGRADED' ? now - Math.floor(Math.random() * 1000) : n.lastHeartbeat,
          }));
          return {
            ...parsed,
            activeOperation: null,
            activeTransfers: [],
            metrics: this.calculateMetrics(parsed.nodes, parsed.objects, parsed.replicas),
          };
        }
      }
    } catch {
      // fallback to fresh
    }
    return defaultData;
  }

  private buildFreshData(): VaultState {
    const nodes = getInitialNodes();
    const { objects, replicas } = getInitialObjects();
    const now = Date.now();

    const initialEvents: SystemEvent[] = [
      {
        id: 'evt_init_1',
        timestamp: now - 3600000 * 2,
        operation: 'HEARTBEAT',
        status: 'SUCCESS',
        message: 'Cluster initialized with 5 nodes across 3 fault domains (US-East, US-Central, US-West).',
      },
      {
        id: 'evt_init_2',
        timestamp: now - 3600000,
        operation: 'VERIFY',
        status: 'SUCCESS',
        message: 'Integrity scanner completed: 5 objects, 15 replicas verified with SHA-256 signatures.',
      },
      {
        id: 'evt_init_3',
        timestamp: now - 60000 * 15,
        operation: 'WRITE',
        objectId: 'obj_001',
        objectName: 'presentation.pdf',
        status: 'SUCCESS',
        message: 'Object updated to v2. Replicas quorum synchronized on Node 01, Node 03, Node 04.',
      },
    ];

    const initialExplanations: DecisionExplanation[] = [
      {
        id: 'expl_init_1',
        timestamp: now - 3600000,
        title: 'Rack-Aware Replica Placement',
        trigger: 'Object storage request for presentation.pdf with Replication Factor = 3',
        invariant: 'Anti-Affinity Rule: No two replicas placed in the same physical rack domain',
        reasoning: 'Evaluated candidate nodes. Selected Node 01 (Rack Alpha), Node 03 (Rack Beta), Node 04 (Rack Gamma) to prevent correlated hardware loss.',
        action: 'Dispatched parallel writes across 3 independent availability zones.',
        outcome: 'Quorum established (3/3). Fault tolerance threshold met.',
        category: 'SELF_HEAL',
      },
    ];

    const state: VaultState = {
      nodes,
      objects,
      replicas,
      events: initialEvents,
      explanations: initialExplanations,
      selectedPolicy: 'HIGH_DURABILITY',
      replicationFactor: 3,
      isAutoRepairEnabled: true,
      activeOperation: null,
      activeTransfers: [],
      metrics: this.calculateMetrics(nodes, objects, replicas),
      lastIntegrityReport: null,
    };


    return state;
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore quota error
    }
  }

  private notify(): void {
    this.state.metrics = this.calculateMetrics(this.state.nodes, this.state.objects, this.state.replicas);
    this.saveState();
    this.listeners.forEach((fn) => fn(this.state));
  }

  public subscribe(fn: (state: VaultState) => void): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getState(): VaultState {
    return this.state;
  }

  private calculateMetrics(nodes: StorageNode[], objects: StorageObject[], replicas: ObjectReplica[]): ClusterMetrics {
    const totalStorageGB = nodes.reduce((acc, n) => acc + n.totalCapacityGB, 0);
    const usedStorageGB = parseFloat(nodes.reduce((acc, n) => acc + n.usedCapacityGB, 0).toFixed(1));
    const activeNodes = nodes.filter((n) => n.status === 'HEALTHY' || n.status === 'DEGRADED').length;

    let satisfiedObjects = 0;
    for (const obj of objects) {
      const activeHealthyReplicas = replicas.filter(
        (r) => r.objectId === obj.objectId &&
               r.status === 'VERIFIED' &&
               nodes.find((n) => n.id === r.nodeId && (n.status === 'HEALTHY' || n.status === 'DEGRADED'))
      );
      if (activeHealthyReplicas.length >= obj.replicationFactor) {
        satisfiedObjects++;
      }
    }

    const replicationHealthPercent = objects.length > 0
      ? Math.round((satisfiedObjects / objects.length) * 100)
      : 100;

    const repairEvents = this.state?.events.filter((e) => e.operation === 'REPAIR' && e.status === 'SUCCESS').length || 0;
    const corruptionEvents = this.state?.events.filter((e) => e.operation === 'CORRUPT').length || 0;

    return {
      totalObjects: objects.length,
      totalStorageGB,
      usedStorageGB,
      activeNodes,
      totalNodes: nodes.length,
      replicationHealthPercent,
      repairOperationsCount: Math.max(1, repairEvents),
      corruptionsDetectedCount: corruptionEvents,
      avgRepairTimeMs: 1420,
    };
  }

  private startHeartbeatLoop(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;

      this.state.nodes = this.state.nodes.map((node) => {
        if (node.status === 'HEALTHY' || node.status === 'DEGRADED') {
          changed = true;
          return {
            ...node,
            lastHeartbeat: now,
            activeIOPs: Math.max(20, Math.floor(node.activeIOPs + (Math.random() * 20 - 10))),
          };
        }
        return node;
      });

      if (changed) {
        this.notify();
      }
    }, 2500);
  }

  // -------------------------------------------------------------
  // LOGGING & EXPLAINABILITY
  // -------------------------------------------------------------

  public logEvent(
    operation: OperationType,
    status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'IN_PROGRESS',
    message: string,
    meta?: { objectId?: string; objectName?: string; nodeId?: string; nodeName?: string; details?: string }
  ): void {
    const event: SystemEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      operation,
      status,
      message,
      objectId: meta?.objectId,
      objectName: meta?.objectName,
      nodeId: meta?.nodeId,
      nodeName: meta?.nodeName,
      details: meta?.details,
    };

    this.state.events = [event, ...this.state.events.slice(0, 75)];
    this.notify();
  }

  public recordDecision(explanation: Omit<DecisionExplanation, 'id' | 'timestamp'>): void {
    const fullExplanation: DecisionExplanation = {
      ...explanation,
      id: `expl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    this.state.explanations = [fullExplanation, ...this.state.explanations.slice(0, 35)];
    this.notify();
  }

  // -------------------------------------------------------------
  // DURABILITY POLICY
  // -------------------------------------------------------------

  public setDurabilityPolicy(policyId: DurabilityPolicyId): void {
    const policy = DURABILITY_POLICIES.find((p) => p.id === policyId) || DURABILITY_POLICIES[1];
    this.state.selectedPolicy = policy.id;
    this.state.replicationFactor = policy.replicas;

    this.logEvent('REPLICATE', 'SUCCESS', `Cluster durability policy updated to ${policy.name} (N=${policy.replicas}).`, {
      details: `${policy.faultTolerance} with ${policy.storageOverhead}.`,
    });
    this.notify();
  }

  public toggleAutoRepair(enabled?: boolean): void {
    this.state.isAutoRepairEnabled = enabled ?? !this.state.isAutoRepairEnabled;
    this.logEvent(
      'REPAIR',
      'SUCCESS',
      `Autonomous Self-Healing Repair Engine ${this.state.isAutoRepairEnabled ? 'ENABLED' : 'PAUSED'}.`
    );
    this.notify();
  }

  // -------------------------------------------------------------
  // OBJECT STORAGE: UPLOAD & WRITE
  // -------------------------------------------------------------

  public async uploadObject(params: {
    fileName: string;
    fileSizeMB: number;
    mimeType: string;
    replicationFactor?: number;
    description?: string;
    contentPreview?: string;
  }): Promise<StorageObject> {
    const rf = params.replicationFactor || this.state.replicationFactor;
    const objectId = `obj_${Date.now().toString().slice(-5)}_${Math.random().toString(36).substring(2, 5)}`;
    const checksum = generateChecksum(params.fileName, `${Date.now()}_${params.fileSizeMB}`);
    const now = Date.now();

    this.state.activeOperation = `Writing ${params.fileName} across ${rf} nodes...`;
    this.notify();

    // Select candidate healthy nodes
    const healthyNodes = this.state.nodes.filter(
      (n) => (n.status === 'HEALTHY' || n.status === 'DEGRADED') && n.availableCapacityGB >= (params.fileSizeMB / 1024)
    );

    if (healthyNodes.length < rf) {
      this.state.activeOperation = null;
      this.logEvent('WRITE', 'ERROR', `Upload rejected: Insufficient healthy nodes for replication factor ${rf} (available: ${healthyNodes.length}).`);
      throw new Error(`Insufficient healthy nodes in cluster. Needed: ${rf}, Available: ${healthyNodes.length}`);
    }

    // Sort by lowest usage first, prioritizing rack diversity
    const selectedNodes: StorageNode[] = [];
    const usedRacks = new Set<string>();

    // Pass 1: pick nodes from distinct racks
    for (const node of [...healthyNodes].sort((a, b) => a.usedCapacityGB - b.usedCapacityGB)) {
      if (!usedRacks.has(node.rack)) {
        selectedNodes.push(node);
        usedRacks.add(node.rack);
        if (selectedNodes.length === rf) break;
      }
    }

    // Pass 2: if more nodes needed, pick remaining least-utilized
    if (selectedNodes.length < rf) {
      for (const node of [...healthyNodes].sort((a, b) => a.usedCapacityGB - b.usedCapacityGB)) {
        if (!selectedNodes.some((n) => n.id === node.id)) {
          selectedNodes.push(node);
          if (selectedNodes.length === rf) break;
        }
      }
    }

    const replicaLocations = selectedNodes.map((n) => n.id);

    const newObject: StorageObject = {
      objectId,
      fileName: params.fileName,
      fileSizeMB: params.fileSizeMB,
      mimeType: params.mimeType,
      createdAt: now,
      updatedAt: now,
      version: 1,
      versionsHistory: [
        {
          version: 1,
          checksum,
          updatedAt: now,
          sizeMB: params.fileSizeMB,
          note: 'Initial ingest committed to cluster quorum',
        },
      ],
      checksum,
      replicationFactor: rf,
      replicaLocations,
      status: 'HEALTHY',
      description: params.description || `Object uploaded at ${new Date(now).toLocaleTimeString()}`,
      contentPreview: params.contentPreview || `[Encrypted stream: ${params.fileName} / ${params.fileSizeMB}MB]`,
    };

    // Create replicas
    const newReplicas: ObjectReplica[] = replicaLocations.map((nodeId) => ({
      replicaId: `rep_${objectId}_${nodeId}`,
      objectId,
      nodeId,
      version: 1,
      expectedChecksum: checksum,
      actualChecksum: checksum,
      status: 'VERIFIED',
      lastVerifiedAt: now,
      sizeMB: params.fileSizeMB,
    }));

    // Update nodes
    const sizeGB = parseFloat((params.fileSizeMB / 1024).toFixed(3));
    this.state.nodes = this.state.nodes.map((node) => {
      if (replicaLocations.includes(node.id)) {
        const newUsed = parseFloat((node.usedCapacityGB + sizeGB).toFixed(2));
        return {
          ...node,
          usedCapacityGB: newUsed,
          availableCapacityGB: parseFloat((node.totalCapacityGB - newUsed).toFixed(2)),
          storedObjectIds: [...node.storedObjectIds, objectId],
          replicaCount: node.replicaCount + 1,
        };
      }
      return node;
    });

    this.state.objects = [newObject, ...this.state.objects];
    this.state.replicas = [...this.state.replicas, ...newReplicas];
    this.state.activeOperation = null;

    // Dispatch visual transfer animation packets
    const transferBatch: ActiveTransfer[] = replicaLocations.map((nId) => ({
      id: `xfer_up_${objectId}_${nId}`,
      sourceNodeId: 'controller',
      targetNodeId: nId,
      objectId,
      fileName: params.fileName,
      progressPercent: 100,
      transferType: 'REPLICATION',
    }));
    this.state.activeTransfers = [...this.state.activeTransfers, ...transferBatch];
    setTimeout(() => {
      this.state.activeTransfers = this.state.activeTransfers.filter(
        (t) => !transferBatch.some((tb) => tb.id === t.id)
      );
      this.notify();
    }, 2400);

    this.logEvent('WRITE', 'SUCCESS', `Object "${params.fileName}" ingested & replicated to ${replicaLocations.join(', ')}.`, {
      objectId,
      objectName: params.fileName,
      details: `Checksum: ${checksum.slice(0, 16)}... | Replication Factor: ${rf}/${rf}`,
    });

    this.recordDecision({
      title: `Replica Placement: ${params.fileName}`,
      trigger: `Client uploaded ${params.fileName} (${params.fileSizeMB} MB)`,
      invariant: `Target replication factor = ${rf}. Fault domain diversity satisfied.`,
      reasoning: `Selected ${selectedNodes.map((n) => `${n.name} (${n.rack})`).join(', ')} based on load balance and rack isolation.`,
      action: `Parallel writes dispatched and verified with SHA-256 hash.`,
      outcome: `Object healthy with quorum across ${selectedNodes.length} nodes.`,
      category: 'SELF_HEAL',
    });

    this.notify();
    return newObject;
  }

  // -------------------------------------------------------------
  // OBJECT STORAGE: READ / RETRIEVE (Survives Node Failure)
  // -------------------------------------------------------------

  public traceReadObject(objectId: string): ReadTraceResult {
    const object = this.state.objects.find((o) => o.objectId === objectId);
    const now = Date.now();
    if (!object) {
      return {
        objectId,
        fileName: 'Unknown Object',
        requestedAt: now,
        steps: [
          {
            nodeId: 'none',
            nodeName: 'Metadata Registry',
            status: 'FAILED',
            latencyMs: 0.5,
            message: 'Object identifier not found in cluster metadata registry.',
          },
        ],
        success: false,
        failoverOccurred: false,
        checksumMatched: false,
      };
    }

    const steps: ReadTraceStep[] = [];
    const replicas = this.state.replicas.filter((r) => r.objectId === objectId);
    let servingNode: StorageNode | null = null;
    let servingReplica: ObjectReplica | null = null;
    let failoverOccurred = false;

    for (let i = 0; i < replicas.length; i++) {
      const rep = replicas[i];
      const node = this.state.nodes.find((n) => n.id === rep.nodeId);
      const nodeName = node?.name || rep.nodeId;

      if (!node || node.status === 'FAILED') {
        failoverOccurred = true;
        steps.push({
          nodeId: rep.nodeId,
          nodeName,
          status: 'FAILED',
          latencyMs: 24.5,
          message: `Connection refused: Host process is DEAD. Heartbeat timed out. Transparently failing over to next replica.`,
        });
        continue;
      }

      if (node.status === 'PARTITIONED') {
        failoverOccurred = true;
        steps.push({
          nodeId: rep.nodeId,
          nodeName,
          status: 'FAILED',
          latencyMs: 32.0,
          message: `Route blocked: Switch isolated node. Split-brain safeguard prevented reading from partitioned host.`,
        });
        continue;
      }

      if (rep.status === 'CORRUPTED' || rep.expectedChecksum !== rep.actualChecksum) {
        failoverOccurred = true;
        steps.push({
          nodeId: rep.nodeId,
          nodeName,
          status: 'FAILED',
          latencyMs: 3.8,
          message: `Silent bit-rot detected! SHA-256 hash mismatch (${rep.actualChecksum.slice(0, 8)}... != ${rep.expectedChecksum.slice(0, 8)}...). Quarantined.`,
        });
        continue;
      }

      // Valid replica!
      servingNode = node;
      servingReplica = rep;
      steps.push({
        nodeId: rep.nodeId,
        nodeName,
        status: 'SUCCESS',
        latencyMs: parseFloat((Math.random() * 2 + 1.2).toFixed(1)),
        message: `200 OK: Valid replica stream verified. SHA-256 integrity match confirmed (${rep.expectedChecksum.slice(0, 10)}...).`,
      });
      break;
    }

    return {
      objectId: object.objectId,
      fileName: object.fileName,
      requestedAt: now,
      steps,
      success: Boolean(servingNode),
      servingNodeId: servingNode?.id,
      servingNodeName: servingNode?.name,
      failoverOccurred,
      checksumMatched: Boolean(servingReplica && servingReplica.expectedChecksum === servingReplica.actualChecksum),
    };
  }

  public triggerDisasterScenario(scenarioId: 'SINGLE_FAIL' | 'DOUBLE_FAIL' | 'BIT_ROT' | 'PARTITION_RACK' | 'HIGH_SKEW' | 'READ_STORM'): void {
    switch (scenarioId) {
      case 'SINGLE_FAIL':
        this.failNode('node-3');
        break;
      case 'DOUBLE_FAIL':
        this.failNode('node-2');
        setTimeout(() => this.failNode('node-4'), 300);
        break;
      case 'BIT_ROT':
        this.corruptReplica('obj_002', 'node-1');
        break;
      case 'PARTITION_RACK':
        this.partitionNode('node-4');
        setTimeout(() => this.partitionNode('node-5'), 250);
        break;
      case 'HIGH_SKEW':
        this.rebalanceCluster();
        break;
      case 'READ_STORM':
        this.simulateTrafficBurst();
        break;
    }
  }

  public readObject(objectId: string): {
    success: boolean;
    object?: StorageObject;
    servedByNodeId?: string;
    failoverOccurred?: boolean;
    message: string;
  } {
    const object = this.state.objects.find((o) => o.objectId === objectId);
    if (!object) {
      return { success: false, message: 'Object not found in metadata registry.' };
    }

    const replicas = this.state.replicas.filter((r) => r.objectId === objectId);

    // Look for a healthy node with a verified replica
    let chosenReplica: ObjectReplica | null = null;
    let chosenNode: StorageNode | null = null;
    let failedNodeEncountered: string | null = null;

    for (const replica of replicas) {
      const node = this.state.nodes.find((n) => n.id === replica.nodeId);
      if (!node || node.status === 'FAILED' || node.status === 'PARTITIONED') {
        failedNodeEncountered = replica.nodeId;
        continue;
      }
      if (replica.status === 'CORRUPTED') {
        continue;
      }
      chosenReplica = replica;
      chosenNode = node;
      break;
    }

    if (!chosenReplica || !chosenNode) {
      this.logEvent('READ', 'ERROR', `Read failed for "${object.fileName}": Quorum lost. All replicas offline or corrupted.`, {
        objectId,
        objectName: object.fileName,
      });
      return {
        success: false,
        object,
        message: 'Data unavailable: All replica nodes are offline or corrupted. Automatic repair pending.',
      };
    }

    const failoverOccurred = Boolean(failedNodeEncountered);

    this.logEvent(
      'READ',
      'SUCCESS',
      failoverOccurred
        ? `Read "${object.fileName}" via transparent failover to ${chosenNode.name} (Primary ${failedNodeEncountered} was offline).`
        : `Read "${object.fileName}" served directly by ${chosenNode.name}.`,
      {
        objectId,
        objectName: object.fileName,
        nodeId: chosenNode.id,
        nodeName: chosenNode.name,
      }
    );

    return {
      success: true,
      object,
      servedByNodeId: chosenNode.id,
      failoverOccurred,
      message: `Object retrieved successfully from ${chosenNode.name}. Verified checksum: ${chosenReplica.expectedChecksum.slice(0, 12)}...`,
    };
  }

  // -------------------------------------------------------------
  // NODE FAILURE & NETWORK PARTITION
  // -------------------------------------------------------------

  public failNode(nodeId: string): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node || node.status === 'FAILED') return;

    const previousStatus = node.status;
    this.state.nodes = this.state.nodes.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            status: 'FAILED',
            networkConnectivity: 'DISCONNECTED',
            activeIOPs: 0,
          }
        : n
    );

    this.logEvent('FAILOVER', 'ERROR', `Storage node ${node.name} CRASHED. Heartbeat terminated.`, {
      nodeId: node.id,
      nodeName: node.name,
      details: 'Node process died. I/O channels closed. Immediate missing replica audit started.',
    });

    // Check affected objects
    this.reconcileObjectsStatus();

    this.recordDecision({
      title: `Node Crash Detected: ${node.name}`,
      trigger: `Failure detector logged missing heartbeat for ${node.id}`,
      invariant: `Cluster durability invariant violated: Active replicas < desired replication factor`,
      reasoning: `${node.storedObjectIds.length} object replicas stranded on offline host. Self-healing scheduler triggered.`,
      action: `Marked node FAILED. Scheduled re-replication of lost replicas to healthy surviving nodes.`,
      outcome: `Objects transitioned to DEGRADED state awaiting autonomous repair.`,
      category: 'FAILOVER',
    });

    this.notify();

    // Trigger auto-repair if enabled
    if (this.state.isAutoRepairEnabled) {
      setTimeout(() => {
        this.runAutonomousRepair();
      }, 700);
    }
  }

  public restartNode(nodeId: string): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const now = Date.now();
    this.state.nodes = this.state.nodes.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            status: 'HEALTHY',
            networkConnectivity: 'CONNECTED',
            lastHeartbeat: now,
            activeIOPs: 45,
          }
        : n
    );

    this.logEvent('RESTART', 'SUCCESS', `Node ${node.name} restarted and reconnected to cluster bus.`, {
      nodeId: node.id,
      nodeName: node.name,
      details: 'Gossip heartbeat re-established. Reconciling object replica catalog.',
    });

    this.reconcileObjectsStatus();

    this.recordDecision({
      title: `Node Recovery: ${node.name}`,
      trigger: `Node agent process rebooted and sent fresh heartbeat`,
      invariant: `Cluster membership reconciled`,
      reasoning: `Node restored capacity. Re-verifying stored replica checksums to ensure zero bit degradation during offline state.`,
      action: `Re-added node to healthy scheduling pool.`,
      outcome: `Cluster capacity increased by ${node.availableCapacityGB} GB.`,
      category: 'SELF_HEAL',
    });

    this.notify();
  }

  public partitionNode(nodeId: string): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node || node.status === 'PARTITIONED') return;

    this.state.nodes = this.state.nodes.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            status: 'PARTITIONED',
            networkConnectivity: 'TIMEOUT',
            activeIOPs: 0,
          }
        : n
    );

    this.logEvent('PARTITION', 'WARNING', `Network partition isolated ${node.name}. Connectivity TIMEOUT.`, {
      nodeId: node.id,
      nodeName: node.name,
      details: 'Node is alive internally but packet routes are blocked. Split-brain prevention active.',
    });

    this.reconcileObjectsStatus();

    this.recordDecision({
      title: `Network Partition: ${node.name}`,
      trigger: `Keep-alive SYN/ACK dropped on switch port for ${node.id}`,
      invariant: `CAP Theorem: Favoring Consistency over Availability for partitioned node`,
      reasoning: `To avoid stale writes or split-brain divergences, ${node.name} is isolated from controller quorum. Data preserved on disk without premature eviction.`,
      action: `Marked node PARTITIONED. Isolated replicas excluded from read quorum.`,
      outcome: `Cluster health monitored. Replicas re-routed to connected partition.`,
      category: 'PARTITION',
    });

    this.notify();

    if (this.state.isAutoRepairEnabled) {
      setTimeout(() => {
        this.runAutonomousRepair();
      }, 900);
    }
  }

  public restoreNetwork(nodeId: string): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const now = Date.now();
    this.state.nodes = this.state.nodes.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            status: 'HEALTHY',
            networkConnectivity: 'CONNECTED',
            lastHeartbeat: now,
            activeIOPs: 60,
          }
        : n
    );

    this.logEvent('HEARTBEAT', 'SUCCESS', `Network routes restored to ${node.name}. Synchronization complete.`, {
      nodeId: node.id,
      nodeName: node.name,
      details: 'Two-way cluster mesh communication re-established. Checksum validation running.',
    });

    this.reconcileObjectsStatus();
    this.notify();
  }

  // -------------------------------------------------------------
  // DATA CORRUPTION SIMULATION & REPAIR
  // -------------------------------------------------------------

  public corruptReplica(objectId: string, nodeId: string): void {
    const object = this.state.objects.find((o) => o.objectId === objectId);
    const replica = this.state.replicas.find((r) => r.objectId === objectId && r.nodeId === nodeId);
    const node = this.state.nodes.find((n) => n.id === nodeId);

    if (!object || !replica || !node) return;

    const corruptedChecksum = corruptChecksumString(replica.expectedChecksum);

    this.state.replicas = this.state.replicas.map((r) =>
      r.replicaId === replica.replicaId
        ? {
            ...r,
            actualChecksum: corruptedChecksum,
            status: 'CORRUPTED',
          }
        : r
    );

    // Update object status
    this.reconcileObjectsStatus();

    this.logEvent('CORRUPT', 'ERROR', `DATA CORRUPTION DETECTED: Replica on ${node.name} for "${object.fileName}" has invalid checksum.`, {
      objectId,
      objectName: object.fileName,
      nodeId,
      nodeName: node.name,
      details: `Expected: ${replica.expectedChecksum.slice(0, 14)}... | Actual: ${corruptedChecksum.slice(0, 14)}...`,
    });

    this.recordDecision({
      title: `Silent Bit-Rot Detected: ${object.fileName}`,
      trigger: `Integrity scanner detected hash divergence on ${node.name}`,
      invariant: `Cryptographic invariant: SHA-256(DiskData) must match AuthoritativeMetadata`,
      reasoning: `Expected hash ${replica.expectedChecksum.slice(0, 10)} did not match disk hash ${corruptedChecksum.slice(0, 10)}. Marking replica tainted to prevent serving bad data to clients.`,
      action: `Quarantined tainted replica on ${node.name}. Scheduled peer replication from verified healthy replica.`,
      outcome: `Integrity check alerted. Auto-repair scheduled.`,
      category: 'CORRUPTION',
    });

    this.notify();

    // Trigger auto-repair if enabled
    if (this.state.isAutoRepairEnabled) {
      setTimeout(() => {
        this.repairCorruptedReplica(objectId, nodeId);
      }, 1000);
    }
  }

  public repairCorruptedReplica(objectId: string, targetNodeId: string): void {
    const object = this.state.objects.find((o) => o.objectId === objectId);
    const corruptedReplica = this.state.replicas.find((r) => r.objectId === objectId && r.nodeId === targetNodeId);
    const targetNode = this.state.nodes.find((n) => n.id === targetNodeId);

    if (!object || !corruptedReplica || !targetNode) return;

    // Find healthy replica source
    const healthyReplica = this.state.replicas.find(
      (r) => r.objectId === objectId &&
             r.nodeId !== targetNodeId &&
             r.status === 'VERIFIED' &&
             this.state.nodes.find((n) => n.id === r.nodeId && (n.status === 'HEALTHY' || n.status === 'DEGRADED'))
    );

    if (!healthyReplica) {
      this.logEvent('REPAIR', 'ERROR', `Cannot repair "${object.fileName}": No healthy source replicas available!`, {
        objectId,
        objectName: object.fileName,
      });
      return;
    }

    const sourceNode = this.state.nodes.find((n) => n.id === healthyReplica.nodeId);

    // Overwrite corrupted replica with clean data
    this.state.replicas = this.state.replicas.map((r) =>
      r.replicaId === corruptedReplica.replicaId
        ? {
            ...r,
            actualChecksum: r.expectedChecksum,
            status: 'VERIFIED',
            lastVerifiedAt: Date.now(),
          }
        : r
    );

    this.reconcileObjectsStatus();

    this.logEvent(
      'REPAIR',
      'SUCCESS',
      `Corrupted replica of "${object.fileName}" on ${targetNode.name} successfully REPAIRED from ${sourceNode?.name}.`,
      {
        objectId,
        objectName: object.fileName,
        nodeId: targetNodeId,
        nodeName: targetNode.name,
        details: `Byte-by-byte sync stream completed. Recomputed checksum matches authoritative SHA-256.`,
      }
    );

    this.recordDecision({
      title: `Cryptographic Self-Heal: ${object.fileName}`,
      trigger: `Corrupted replica quarantined on ${targetNode.name}`,
      invariant: `Object must maintain 100% verified replicas`,
      reasoning: `Located healthy donor replica on ${sourceNode?.name}. Transferred verified byte stream and recomputed SHA-256.`,
      action: `Overwrote corrupted disk blocks on ${targetNode.name} with donor payload.`,
      outcome: `Replica verified. Object returned to HEALTHY state.`,
      category: 'CORRUPTION',
    });

    this.notify();
  }

  // -------------------------------------------------------------
  // AUTONOMOUS REPAIR ENGINE (Missing Replicas)
  // -------------------------------------------------------------

  public runAutonomousRepair(): void {
    if (this.isProcessingRepair) return;
    this.isProcessingRepair = true;

    try {
      const healthyNodes = this.state.nodes.filter((n) => n.status === 'HEALTHY' || n.status === 'DEGRADED');

      for (const object of this.state.objects) {
        // Active healthy replicas
        const activeReplicas = this.state.replicas.filter(
          (r) => r.objectId === object.objectId &&
                 r.status === 'VERIFIED' &&
                 healthyNodes.some((n) => n.id === r.nodeId)
        );

        if (activeReplicas.length < object.replicationFactor) {
          const needed = object.replicationFactor - activeReplicas.length;

          // Find candidate nodes that don't already have a replica of this object
          const currentNodesWithObject = new Set(
            this.state.replicas
              .filter((r) => r.objectId === object.objectId && r.status === 'VERIFIED')
              .map((r) => r.nodeId)
          );

          const candidateNodes = healthyNodes
            .filter((n) => !currentNodesWithObject.has(n.id) && n.availableCapacityGB >= (object.fileSizeMB / 1024))
            .sort((a, b) => a.usedCapacityGB - b.usedCapacityGB);

          if (candidateNodes.length > 0) {
            const targetNode = candidateNodes[0];
            const donorReplica = activeReplicas[0];
            const donorNode = this.state.nodes.find((n) => n.id === donorReplica?.nodeId);

            // Create new replica on target node
            const newReplica: ObjectReplica = {
              replicaId: `rep_${object.objectId}_${targetNode.id}`,
              objectId: object.objectId,
              nodeId: targetNode.id,
              version: object.version,
              expectedChecksum: object.checksum,
              actualChecksum: object.checksum,
              status: 'VERIFIED',
              lastVerifiedAt: Date.now(),
              sizeMB: object.fileSizeMB,
            };

            const sizeGB = parseFloat((object.fileSizeMB / 1024).toFixed(3));

            // Update nodes
            this.state.nodes = this.state.nodes.map((n) => {
              if (n.id === targetNode.id) {
                const newUsed = parseFloat((n.usedCapacityGB + sizeGB).toFixed(2));
                return {
                  ...n,
                  usedCapacityGB: newUsed,
                  availableCapacityGB: parseFloat((n.totalCapacityGB - newUsed).toFixed(2)),
                  storedObjectIds: [...n.storedObjectIds, object.objectId],
                  replicaCount: n.replicaCount + 1,
                };
              }
              return n;
            });

            // Update object replica locations
            const updatedLocations = Array.from(new Set([...object.replicaLocations.filter((id) => {
              const nodeState = this.state.nodes.find((n) => n.id === id);
              return nodeState && (nodeState.status === 'HEALTHY' || nodeState.status === 'DEGRADED');
            }), targetNode.id]));

            this.state.objects = this.state.objects.map((obj) =>
              obj.objectId === object.objectId
                ? {
                    ...obj,
                    replicaLocations: updatedLocations,
                    status: updatedLocations.length >= obj.replicationFactor ? 'HEALTHY' : 'DEGRADED',
                  }
                : obj
            );

            this.state.replicas = [...this.state.replicas, newReplica];

            // Emit live visual repair stream
            const repairTransfer: ActiveTransfer = {
              id: `xfer_rep_${object.objectId}_${targetNode.id}`,
              sourceNodeId: donorNode?.id || 'node-1',
              targetNodeId: targetNode.id,
              objectId: object.objectId,
              fileName: object.fileName,
              progressPercent: 100,
              transferType: 'REPAIR',
            };
            this.state.activeTransfers = [...this.state.activeTransfers, repairTransfer];
            setTimeout(() => {
              this.state.activeTransfers = this.state.activeTransfers.filter((t) => t.id !== repairTransfer.id);
              this.notify();
            }, 2600);

            this.logEvent(
              'REPAIR',
              'SUCCESS',
              `Self-healing repair completed for "${object.fileName}": Created replacement replica on ${targetNode.name} (Source: ${donorNode?.name || 'Peer'}).`,
              {
                objectId: object.objectId,
                objectName: object.fileName,
                nodeId: targetNode.id,
                nodeName: targetNode.name,
                details: `Replication restored to ${updatedLocations.length}/${object.replicationFactor}. Invariant satisfied.`,
              }
            );

            this.recordDecision({
              title: `Autonomous Replica Re-creation: ${object.fileName}`,
              trigger: `Replica deficit detected (${activeReplicas.length}/${object.replicationFactor} surviving)`,
              invariant: `Durability policy dictates minimum ${object.replicationFactor} active replicas`,
              reasoning: `Evaluated eligible nodes. Selected ${targetNode.name} due to lowest utilization (${targetNode.usedCapacityGB} GB used) and rack balance.`,
              action: `Streamed replica from ${donorNode?.name || 'healthy peer'} to ${targetNode.name}. Updated metadata index.`,
              outcome: `Quorum fully restored. Replication invariant satisfied.`,
              category: 'SELF_HEAL',
            });
          }
        }
      }
    } finally {
      this.isProcessingRepair = false;
      this.reconcileObjectsStatus();
      this.notify();
    }
  }

  // -------------------------------------------------------------
  // CLUSTER REBALANCING
  // -------------------------------------------------------------

  public rebalanceCluster(): void {
    const healthyNodes = this.state.nodes.filter((n) => n.status === 'HEALTHY' || n.status === 'DEGRADED');
    if (healthyNodes.length < 2) {
      this.logEvent('REBALANCE', 'WARNING', 'Cannot rebalance: Need at least 2 active nodes.');
      return;
    }

    // Identify highest usage node vs lowest usage node
    const sorted = [...healthyNodes].sort((a, b) => b.usedCapacityGB - a.usedCapacityGB);
    const donorNode = sorted[0];
    const receiverNode = sorted[sorted.length - 1];

    const differenceGB = donorNode.usedCapacityGB - receiverNode.usedCapacityGB;
    if (differenceGB < 5) {
      this.logEvent('REBALANCE', 'SUCCESS', `Cluster storage is already well-balanced (Skew < 5 GB across all nodes).`);
      return;
    }

    // Find an object stored on donorNode that is NOT yet on receiverNode
    const eligibleObject = this.state.objects.find(
      (obj) => obj.replicaLocations.includes(donorNode.id) && !obj.replicaLocations.includes(receiverNode.id)
    );

    if (!eligibleObject) {
      this.logEvent('REBALANCE', 'WARNING', `No eligible migratory replicas found between ${donorNode.name} and ${receiverNode.name}.`);
      return;
    }

    const sizeGB = parseFloat((eligibleObject.fileSizeMB / 1024).toFixed(3));

    // Move replica: Add to receiver, remove from donor
    this.state.replicas = this.state.replicas.filter(
      (r) => !(r.objectId === eligibleObject.objectId && r.nodeId === donorNode.id)
    );

    const newReplica: ObjectReplica = {
      replicaId: `rep_${eligibleObject.objectId}_${receiverNode.id}`,
      objectId: eligibleObject.objectId,
      nodeId: receiverNode.id,
      version: eligibleObject.version,
      expectedChecksum: eligibleObject.checksum,
      actualChecksum: eligibleObject.checksum,
      status: 'VERIFIED',
      lastVerifiedAt: Date.now(),
      sizeMB: eligibleObject.fileSizeMB,
    };

    this.state.replicas.push(newReplica);

    // Update object locations
    this.state.objects = this.state.objects.map((obj) =>
      obj.objectId === eligibleObject.objectId
        ? {
            ...obj,
            replicaLocations: obj.replicaLocations.map((id) => (id === donorNode.id ? receiverNode.id : id)),
          }
        : obj
    );

    // Update node capacities
    this.state.nodes = this.state.nodes.map((n) => {
      if (n.id === donorNode.id) {
        const newUsed = parseFloat(Math.max(0, n.usedCapacityGB - sizeGB).toFixed(2));
        return {
          ...n,
          usedCapacityGB: newUsed,
          availableCapacityGB: parseFloat((n.totalCapacityGB - newUsed).toFixed(2)),
          storedObjectIds: n.storedObjectIds.filter((id) => id !== eligibleObject.objectId),
          replicaCount: Math.max(0, n.replicaCount - 1),
        };
      }
      if (n.id === receiverNode.id) {
        const newUsed = parseFloat((n.usedCapacityGB + sizeGB).toFixed(2));
        return {
          ...n,
          usedCapacityGB: newUsed,
          availableCapacityGB: parseFloat((n.totalCapacityGB - newUsed).toFixed(2)),
          storedObjectIds: [...n.storedObjectIds, eligibleObject.objectId],
          replicaCount: n.replicaCount + 1,
        };
      }
      return n;
    });

    this.logEvent(
      'REBALANCE',
      'SUCCESS',
      `Cluster rebalanced: Migrated "${eligibleObject.fileName}" (${eligibleObject.fileSizeMB} MB) from ${donorNode.name} to ${receiverNode.name}.`,
      {
        objectId: eligibleObject.objectId,
        objectName: eligibleObject.fileName,
        details: `${donorNode.name} usage decreased; ${receiverNode.name} capacity populated.`,
      }
    );

    this.recordDecision({
      title: `Cluster Storage Rebalancing`,
      trigger: `Storage skew threshold exceeded between ${donorNode.name} (${donorNode.usedCapacityGB} GB) and ${receiverNode.name} (${receiverNode.usedCapacityGB} GB)`,
      invariant: `Even storage utilization prevents hotspot degradation`,
      reasoning: `Selected object ${eligibleObject.fileName} for background migration. Zero client downtime maintained through warm streaming.`,
      action: `Copied replica to ${receiverNode.name}, verified target checksum, then released donor blocks on ${donorNode.name}.`,
      outcome: `Storage distribution optimized. Delta reduced by ${sizeGB} GB.`,
      category: 'REBALANCE',
    });

    this.notify();
  }

  // -------------------------------------------------------------
  // FULL INTEGRITY AUDIT SCAN
  // -------------------------------------------------------------

  public runIntegrityCheck(): IntegrityCheckReport {
    const startMs = Date.now();
    const issues: IntegrityCheckReport['issues'] = [];
    let healthyReplicas = 0;
    let corruptedReplicas = 0;
    let missingReplicas = 0;

    const healthyNodeIds = new Set(
      this.state.nodes.filter((n) => n.status === 'HEALTHY' || n.status === 'DEGRADED').map((n) => n.id)
    );

    for (const obj of this.state.objects) {
      const objReplicas = this.state.replicas.filter((r) => r.objectId === obj.objectId);

      for (const rep of objReplicas) {
        if (!healthyNodeIds.has(rep.nodeId)) {
          missingReplicas++;
          issues.push({
            objectId: obj.objectId,
            fileName: obj.fileName,
            nodeId: rep.nodeId,
            issue: `Replica hosted on inactive/offline node ${rep.nodeId}`,
          });
        } else if (rep.status === 'CORRUPTED' || rep.expectedChecksum !== rep.actualChecksum) {
          corruptedReplicas++;
          issues.push({
            objectId: obj.objectId,
            fileName: obj.fileName,
            nodeId: rep.nodeId,
            issue: `Checksum mismatch: expected ${rep.expectedChecksum.slice(0, 8)} vs actual ${rep.actualChecksum.slice(0, 8)}`,
          });
        } else {
          healthyReplicas++;
        }
      }

      // Check if replication factor satisfied
      const activeVerified = objReplicas.filter((r) => healthyNodeIds.has(r.nodeId) && r.status === 'VERIFIED').length;
      if (activeVerified < obj.replicationFactor) {
        issues.push({
          objectId: obj.objectId,
          fileName: obj.fileName,
          nodeId: 'cluster',
          issue: `Replication factor deficit: ${activeVerified}/${obj.replicationFactor} healthy replicas online`,
        });
      }
    }

    const duration = Date.now() - startMs + Math.floor(Math.random() * 80) + 120;

    const report: IntegrityCheckReport = {
      id: `rep_${Date.now()}`,
      timestamp: Date.now(),
      totalObjects: this.state.objects.length,
      totalReplicas: this.state.replicas.length,
      healthyReplicas,
      corruptedReplicas,
      missingReplicas,
      scanDurationMs: duration,
      issues,
    };

    this.state.lastIntegrityReport = report;

    this.logEvent(
      'VERIFY',
      issues.length === 0 ? 'SUCCESS' : 'WARNING',
      `Cluster-wide SHA-256 integrity audit finished in ${duration}ms: ${healthyReplicas} healthy, ${corruptedReplicas} corrupted, ${missingReplicas} offline.`,
      {
        details: issues.length === 0 ? '100% cryptographic data integrity verified.' : `${issues.length} integrity anomalies detected.`,
      }
    );

    this.notify();
    return report;
  }

  // -------------------------------------------------------------
  // VERSIONING & CONCURRENT TRAFFIC SIMULATION
  // -------------------------------------------------------------

  public updateObjectVersion(objectId: string, note?: string): void {
    const object = this.state.objects.find((o) => o.objectId === objectId);
    if (!object) return;

    const newVersion = object.version + 1;
    const now = Date.now();
    const newChecksum = generateChecksum(object.fileName, `v${newVersion}_${now}`);
    const sizeDeltaMB = parseFloat((Math.random() * 4 - 1.5).toFixed(1));
    const newSizeMB = Math.max(1, parseFloat((object.fileSizeMB + sizeDeltaMB).toFixed(1)));

    // Create new version entry
    const newVersionRecord = {
      version: newVersion,
      checksum: newChecksum,
      updatedAt: now,
      sizeMB: newSizeMB,
      note: note || `Updated version ${newVersion} with latest changes`,
    };

    // Update object
    this.state.objects = this.state.objects.map((o) =>
      o.objectId === objectId
        ? {
            ...o,
            version: newVersion,
            fileSizeMB: newSizeMB,
            checksum: newChecksum,
            updatedAt: now,
            versionsHistory: [newVersionRecord, ...o.versionsHistory],
          }
        : o
    );

    // Update replicas
    this.state.replicas = this.state.replicas.map((r) =>
      r.objectId === objectId
        ? {
            ...r,
            version: newVersion,
            expectedChecksum: newChecksum,
            actualChecksum: newChecksum,
            sizeMB: newSizeMB,
            lastVerifiedAt: now,
            status: 'VERIFIED',
          }
        : r
    );

    this.logEvent('WRITE', 'SUCCESS', `Object "${object.fileName}" upgraded to version v${newVersion}.`, {
      objectId,
      objectName: object.fileName,
      details: `New SHA-256: ${newChecksum.slice(0, 16)}... Replicas synchronized.`,
    });

    this.recordDecision({
      title: `Object Version Transition: v${newVersion}`,
      trigger: `Client issued write update to ${object.fileName}`,
      invariant: `Monotonic version increment with atomic checksum re-computation`,
      reasoning: `Produced version v${newVersion} and propagated to replicas. Stale version v${object.version} archived in immutable history log.`,
      action: `Updated metadata directory and synchronized replicas.`,
      outcome: `All replicas converged on latest version ${newVersion}.`,
      category: 'VERSIONING',
    });

    this.notify();
  }

  public simulateTrafficBurst(): void {
    const ops: OperationType[] = ['READ', 'READ', 'WRITE', 'READ', 'VERIFY'];
    const objects = this.state.objects;
    const healthyNodes = this.state.nodes.filter((n) => n.status === 'HEALTHY');

    if (objects.length === 0 || healthyNodes.length === 0) return;

    for (let i = 0; i < 5; i++) {
      const op = ops[i % ops.length];
      const obj = objects[i % objects.length];
      const node = healthyNodes[i % healthyNodes.length];

      setTimeout(() => {
        this.logEvent(op, 'SUCCESS', `Concurrent ${op} on "${obj.fileName}" processed by ${node.name}.`, {
          objectId: obj.objectId,
          objectName: obj.fileName,
          nodeId: node.id,
          nodeName: node.name,
          details: `Latency: ${(Math.random() * 8 + 2).toFixed(1)}ms | HTTP/3 QUIC connection`,
        });
      }, i * 220);
    }
  }

  public deleteObject(objectId: string): void {
    const object = this.state.objects.find((o) => o.objectId === objectId);
    if (!object) return;

    const sizeGB = parseFloat((object.fileSizeMB / 1024).toFixed(3));

    // Release capacity on nodes
    this.state.nodes = this.state.nodes.map((n) => {
      if (object.replicaLocations.includes(n.id)) {
        const newUsed = parseFloat(Math.max(0, n.usedCapacityGB - sizeGB).toFixed(2));
        return {
          ...n,
          usedCapacityGB: newUsed,
          availableCapacityGB: parseFloat((n.totalCapacityGB - newUsed).toFixed(2)),
          storedObjectIds: n.storedObjectIds.filter((id) => id !== objectId),
          replicaCount: Math.max(0, n.replicaCount - 1),
        };
      }
      return n;
    });

    // Remove replicas and object
    this.state.replicas = this.state.replicas.filter((r) => r.objectId !== objectId);
    this.state.objects = this.state.objects.filter((o) => o.objectId !== objectId);

    this.logEvent('WRITE', 'SUCCESS', `Object "${object.fileName}" permanently purged from cluster and metadata.`, {
      objectId,
      objectName: object.fileName,
      details: `Freed ${object.fileSizeMB} MB across ${object.replicaLocations.length} storage nodes.`,
    });

    this.notify();
  }

  public resetCluster(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    this.state = this.buildFreshData();
    this.logEvent('HEARTBEAT', 'SUCCESS', 'Cluster state reset to pristine baseline demonstration topology.');
    this.notify();
  }

  // -------------------------------------------------------------
  // INTERNAL RECONCILIATION
  // -------------------------------------------------------------

  private reconcileObjectsStatus(): void {
    const activeHealthyNodes = new Set(
      this.state.nodes.filter((n) => n.status === 'HEALTHY' || n.status === 'DEGRADED').map((n) => n.id)
    );

    this.state.objects = this.state.objects.map((obj) => {
      const objReplicas = this.state.replicas.filter((r) => r.objectId === obj.objectId);
      const onlineReplicas = objReplicas.filter((r) => activeHealthyNodes.has(r.nodeId));
      const corruptedReplicas = onlineReplicas.filter((r) => r.status === 'CORRUPTED');
      const healthyVerifiedReplicas = onlineReplicas.filter((r) => r.status === 'VERIFIED');

      let status = obj.status;

      if (healthyVerifiedReplicas.length === 0) {
        status = 'UNAVAILABLE';
      } else if (corruptedReplicas.length > 0) {
        status = 'CORRUPTED';
      } else if (healthyVerifiedReplicas.length < obj.replicationFactor) {
        status = 'DEGRADED';
      } else {
        status = 'HEALTHY';
      }

      return {
        ...obj,
        status,
      };
    });
  }
}

// Singleton export
export const vaultEngine = new VaultEngine();
