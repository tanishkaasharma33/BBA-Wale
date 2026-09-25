/**
 * VAULT Guided Live Demo Engine
 * Drives the exact 12-stage hackathon narrative:
 * UPLOAD FILE → CREATE 3 REPLICAS → SHOW HEALTHY CLUSTER → KILL NODE →
 * DETECT FAILURE → FILE REMAINS AVAILABLE → AUTOMATIC REPAIR → CORRUPT REPLICA →
 * CHECKSUM MISMATCH → AUTOMATIC REPAIR → VERIFY INTEGRITY → RETURN TO HEALTHY STATE
 */

import { vaultEngine } from './vaultEngine';
import { DemoStep } from '../types/storage';

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    stageName: 'UPLOAD FILE',
    title: '1. Upload Mission-Critical File',
    description: 'Client issues a write request for "financial-core-ledger.db" (210 MB) with High Durability policy (N=3 replicas across distinct availability racks).',
    whatJustHappened: 'The client application initiated a 210 MB write stream. Vault atomically generated a 256-bit SHA-256 cryptographic digest before distributing bytes across the network.',
    systemConcept: 'Content-Addressed Storage & Cryptographic Ingest Hashing',
    expectedOutcome: 'Authoritative SHA-256 checksum generated; placement scheduler queries cluster membership.',
    autoActionText: 'Computing SHA-256 digest and calculating rack placement...',
    focusTarget: 'controller',
  },
  {
    stepNumber: 2,
    stageName: 'CREATE 3 REPLICAS',
    title: '2. Create 3 Multi-Rack Replicas',
    description: 'Vault’s scheduler distributes parallel byte streams to Node 01, Node 03, and Node 05 to enforce physical rack anti-affinity.',
    whatJustHappened: 'Vault evaluated candidate nodes across 3 independent availability zones (Rack Alpha, Beta, Gamma) and dispatched simultaneous replication streams to ensure zero correlated hardware vulnerability.',
    systemConcept: 'Rack Anti-Affinity & Multi-AZ Quorum Placement',
    expectedOutcome: 'Write streams dispatched in parallel across 3 distinct physical server racks.',
    autoActionText: 'Streaming parallel byte packets to Node 01, Node 03, and Node 05...',
    focusTarget: 'nodes',
  },
  {
    stepNumber: 3,
    stageName: 'SHOW HEALTHY CLUSTER',
    title: '3. Show Healthy Cluster (Quorum Confirmed)',
    description: 'All 3 replica nodes confirm byte integrity and commit to disk. Raft consensus metadata records 100% replication health.',
    whatJustHappened: 'All 3 target nodes returned write acknowledgments. The authoritative metadata registry updated the global index. Replication health is 100% (3/3).',
    systemConcept: 'Write Quorum Commitment & Authoritative Consensus (W=3/3)',
    expectedOutcome: 'Cluster reports 100% replication health; all 5 nodes report healthy 2.5s gossip heartbeats.',
    autoActionText: 'Confirming quorum write acknowledgments and metadata sync...',
    focusTarget: 'stats',
  },
  {
    stepNumber: 4,
    stageName: 'KILL NODE',
    title: '4. Kill Storage Node (Simulate Catastrophic Crash)',
    description: 'We intentionally simulate a catastrophic hardware power loss or kernel panic on Node 03 hosting Replica #2.',
    whatJustHappened: 'We simulated a sudden power surge killing Node 03. The node daemon died, terminating TCP sockets and halting all disk I/O channels instantly.',
    systemConcept: 'Catastrophic Host Hardware Outage Simulation',
    expectedOutcome: 'Node 03 process terminated; network socket severed; heartbeat packets cease.',
    autoActionText: 'Terminating Node 03 process and cutting network connection...',
    focusTarget: 'node-3',
  },
  {
    stepNumber: 5,
    stageName: 'DETECT FAILURE',
    title: '5. Detect Failure (Gossip Heartbeat Loss)',
    description: 'Vault’s distributed gossip failure detector notes missing keep-alive packets from Node 03.',
    whatJustHappened: 'The background gossip daemon missed 2 consecutive keep-alive intervals (>2.5s). The cluster watchdog marked Node 03 as FAILED and flagged all hosted replicas as degraded.',
    systemConcept: 'Gossip Mesh & φ-Accrual Heartbeat Failure Detection',
    expectedOutcome: 'Node 03 marked FAILED (Red). Object replication health drops from 3/3 to 2/3 (DEGRADED).',
    autoActionText: 'Failure detector flagged Node 03 timeout. Auditing orphaned replicas...',
    focusTarget: 'node-3',
  },
  {
    stepNumber: 6,
    stageName: 'FILE REMAINS AVAILABLE',
    title: '6. File Remains Available (Zero Downtime Read)',
    description: 'Client requests "financial-core-ledger.db". Vault transparently routes the read to surviving replica on Node 01.',
    whatJustHappened: 'A client requested the file. Even though Node 03 was dead, Vault detected the offline host and transparently failed over to Node 01 in 2.1ms. The application observed 0 errors and zero downtime.',
    systemConcept: 'Transparent Read Quorum Failover with Zero Downtime',
    expectedOutcome: 'Read completes in 2.1ms with 100% verified SHA-256 match from peer replica.',
    autoActionText: 'Dispatching read query with transparent failover to Node 01...',
    focusTarget: 'node-1',
  },
  {
    stepNumber: 7,
    stageName: 'AUTOMATIC REPAIR',
    title: '7. Automatic Repair (Missing Replica Reconstructed)',
    description: 'Vault’s autonomous repair loop detects replica deficit (2/3) and rebuilds replacement replica on Node 02.',
    whatJustHappened: 'The autonomous repair engine observed that active replicas (2) fell below the durability policy (3). It automatically selected the least-loaded healthy host, Node 02, and streamed a verified clone from Node 01.',
    systemConcept: 'Autonomous Self-Healing Quorum Reconstruction',
    expectedOutcome: 'Pristine replica created on Node 02; replication health restored to 3/3.',
    autoActionText: 'Streaming clean replica from Node 01 to Node 02 over internal bus...',
    focusTarget: 'node-2',
  },
  {
    stepNumber: 8,
    stageName: 'CORRUPT REPLICA',
    title: '8. Corrupt Replica (Silent Bit-Rot Injection)',
    description: 'A hardware storage controller fault silently flips bits on Node 05 disk sector.',
    whatJustHappened: 'A storage controller bit-flip corrupted raw disk sectors on Node 05. The file appears physically present to the operating system, but the underlying byte content is secretly tainted.',
    systemConcept: 'Silent Disk Degradation & Bit-Rot Anomaly',
    expectedOutcome: 'Disk blocks on Node 05 modified; actual checksum no longer matches consensus signature.',
    autoActionText: 'Injecting bit-level byte corruption on Node 05 disk partition...',
    focusTarget: 'node-5',
  },
  {
    stepNumber: 9,
    stageName: 'CHECKSUM MISMATCH',
    title: '9. Checksum Mismatch (Integrity Scrubbing Alert)',
    description: 'Vault’s background scrubbing daemon recomputes the SHA-256 hash of Node 05 disk blocks and detects divergence.',
    whatJustHappened: 'Vault’s integrity scrubber computed the SHA-256 hash of the disk block and compared it to authoritative metadata. The hashes diverged! Vault instantly quarantined the corrupted replica to protect clients.',
    systemConcept: 'Cryptographic Checksum Scrubbing & Automatic Quarantine',
    expectedOutcome: 'Replica on Node 05 quarantined as CORRUPTED; mismatch flagged in telemetry.',
    autoActionText: 'Scrubber detected divergence: expected signature ≠ actual disk signature.',
    focusTarget: 'node-5',
  },
  {
    stepNumber: 10,
    stageName: 'AUTOMATIC REPAIR',
    title: '10. Automatic Repair (Cryptographic Self-Heal)',
    description: 'Vault streams verified genuine byte stream from peer replica on Node 01 to overwrite corrupted disk sectors on Node 05.',
    whatJustHappened: 'Vault located the verified clean replica on Node 01 and streamed a fresh bitstream to overwrite the tainted disk blocks on Node 05. The recomputed SHA-256 hash now matches 100%.',
    systemConcept: 'Cryptographic Anti-Entropy Quorum Self-Healing',
    expectedOutcome: 'Corrupted disk blocks overwritten; checksum reverified; replica restored to HEALTHY.',
    autoActionText: 'Overwriting corrupted blocks on Node 05 with genuine stream from Node 01...',
    focusTarget: 'node-5',
  },
  {
    stepNumber: 11,
    stageName: 'VERIFY INTEGRITY',
    title: '11. Verify Integrity (Cluster-Wide Cryptographic Audit)',
    description: 'Vault executes a full cluster-wide cryptographic sweep across all 5 nodes and all stored replicas.',
    whatJustHappened: 'Vault initiated an exhaustive cluster-wide sweep across all 5 nodes and all stored entities. Every single replica was cryptographically verified against the authoritative consensus signatures.',
    systemConcept: 'Exhaustive Cluster-Wide Merkle Audit',
    expectedOutcome: '100% data integrity verified. Zero corrupted, stale, or missing replicas.',
    autoActionText: 'Executing cluster-wide SHA-256 verification sweep across all 5 nodes...',
    focusTarget: 'stats',
  },
  {
    stepNumber: 12,
    stageName: 'RETURN TO HEALTHY STATE',
    title: '12. Return to Healthy State (Full Resilience Demonstrated)',
    description: 'Node 03 reboots, reconciles membership, and the entire cluster returns to 100% operational baseline.',
    whatJustHappened: 'Node 03 rebooted and rejoined the gossip mesh. Replicas reconciled. The cluster has proven it survives physical host crashes, silent bit rot, and network latency with zero human intervention.',
    systemConcept: 'Cluster Quorum Convergence & Node Re-Admission',
    expectedOutcome: 'All 5 nodes healthy; 100% replication durability; cluster fully operational.',
    autoActionText: 'Rebooting Node 03 and re-admitting to cluster quorum. Demo complete!',
    focusTarget: 'all',
  },
];

export class DemoRunner {
  private currentStepIndex: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<(step: DemoStep, isRunning: boolean, isPaused: boolean) => void> = new Set();
  private demoObjectId: string | null = null;

  public subscribe(fn: (step: DemoStep, isRunning: boolean, isPaused: boolean) => void): () => void {
    this.listeners.add(fn);
    fn(DEMO_STEPS[this.currentStepIndex], this.isRunning, this.isPaused);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    const step = DEMO_STEPS[this.currentStepIndex] || DEMO_STEPS[0];
    this.listeners.forEach((fn) => fn(step, this.isRunning, this.isPaused));
  }

  public async startDemo(): Promise<void> {
    this.isRunning = true;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.notify();
    await this.executeCurrentStep();
  }

  public pauseDemo(): void {
    this.isPaused = true;
    if (this.timer) clearTimeout(this.timer);
    this.notify();
  }

  public resumeDemo(): void {
    if (!this.isRunning) {
      this.startDemo();
      return;
    }
    this.isPaused = false;
    this.notify();
    this.scheduleNextStep(800);
  }

  public stopDemo(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timer) clearTimeout(this.timer);
    this.currentStepIndex = 0;
    this.notify();
  }

  public async nextStep(): Promise<void> {
    if (this.currentStepIndex < DEMO_STEPS.length - 1) {
      this.currentStepIndex++;
      this.notify();
      await this.executeCurrentStep();
    } else {
      this.stopDemo();
    }
  }

  public async prevStep(): Promise<void> {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.notify();
      await this.executeCurrentStep();
    }
  }

  private scheduleNextStep(delayMs: number = 5500): void {
    if (this.timer) clearTimeout(this.timer);
    if (!this.isRunning || this.isPaused) return;

    this.timer = setTimeout(async () => {
      if (this.currentStepIndex < DEMO_STEPS.length - 1) {
        this.currentStepIndex++;
        this.notify();
        await this.executeCurrentStep();
      } else {
        this.isRunning = false;
        this.notify();
      }
    }, delayMs);
  }

  private async executeCurrentStep(): Promise<void> {
    const stepNumber = this.currentStepIndex + 1;

    switch (stepNumber) {
      case 1:
        // Stage 1: UPLOAD FILE
        try {
          const uploaded = await vaultEngine.uploadObject({
            fileName: 'financial-core-ledger.db',
            fileSizeMB: 210.0,
            mimeType: 'application/octet-stream',
            replicationFactor: 3,
            description: 'Mission-critical transactional financial ledger (Demo Entity)',
            contentPreview: 'VAULT_LEDGER_MAGIC_BYTES_0x89\n[2,450,000 TRANSACTIONS / MERKLE_ROOT: 0x9f4a1c72...]',
          });
          this.demoObjectId = uploaded.objectId;
        } catch {
          // Object may already exist
        }
        break;

      case 2:
        // Stage 2: CREATE 3 REPLICAS
        break;

      case 3:
        // Stage 3: SHOW HEALTHY CLUSTER
        break;

      case 4:
        // Stage 4: KILL NODE (Node 03)
        vaultEngine.failNode('node-3');
        break;

      case 5:
        // Stage 5: DETECT FAILURE
        break;

      case 6:
        // Stage 6: FILE REMAINS AVAILABLE (Read from Node 01)
        if (this.demoObjectId) {
          vaultEngine.readObject(this.demoObjectId);
        }
        break;

      case 7:
        // Stage 7: AUTOMATIC REPAIR (Clones to Node 02)
        vaultEngine.runAutonomousRepair();
        break;

      case 8:
        // Stage 8: CORRUPT REPLICA (Node 05)
        if (this.demoObjectId) {
          vaultEngine.corruptReplica(this.demoObjectId, 'node-5');
        } else {
          vaultEngine.corruptReplica('obj_002', 'node-1');
        }
        break;

      case 9:
        // Stage 9: CHECKSUM MISMATCH
        break;

      case 10:
        // Stage 10: AUTOMATIC REPAIR (Self-heal corrupted replica)
        if (this.demoObjectId) {
          vaultEngine.repairCorruptedReplica(this.demoObjectId, 'node-5');
        } else {
          vaultEngine.repairCorruptedReplica('obj_002', 'node-1');
        }
        break;

      case 11:
        // Stage 11: VERIFY INTEGRITY (Audit sweep)
        vaultEngine.runIntegrityCheck();
        break;

      case 12:
        // Stage 12: RETURN TO HEALTHY STATE (Reboot Node 03)
        vaultEngine.restartNode('node-3');
        break;

      default:
        break;
    }

    if (this.isRunning && !this.isPaused) {
      this.scheduleNextStep(5500);
    }
  }
}

export const demoRunner = new DemoRunner();
