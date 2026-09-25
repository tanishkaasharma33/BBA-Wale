/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { vaultEngine, VaultState } from './services/vaultEngine';
import { demoRunner, DEMO_STEPS } from './services/demoRunner';
import { Header, ActiveTab } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { SimpleStepsExplainer } from './components/SimpleStepsExplainer';
import { ClusterStats } from './components/ClusterStats';
import { ClusterMap } from './components/ClusterMap';
import { ObjectExplorer } from './components/ObjectExplorer';
import { NodeFleet } from './components/NodeFleet';
import { ChaosLab } from './components/ChaosLab';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { LiveEventStream } from './components/LiveEventStream';
import { ArchitectureView } from './components/ArchitectureView';
import { UploadObjectModal } from './components/UploadObjectModal';
import { MetadataViewerModal } from './components/MetadataViewerModal';
import { IntegrityReportModal } from './components/IntegrityReportModal';
import { LiveDemoPresentationHUD } from './components/LiveDemoPresentationHUD';
import { ReadFailoverTraceModal } from './components/ReadFailoverTraceModal';
import { ChecksumBitRotModal } from './components/ChecksumBitRotModal';
import {
  StorageObject,
  ObjectReplica,
  StorageNode,
  DemoStep,
  ReadTraceResult,
} from './types/storage';

export default function App() {
  const [vaultState, setVaultState] = useState<VaultState>(vaultEngine.getState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewMetadataObject, setViewMetadataObject] = useState<StorageObject | null>(null);
  const [isIntegrityReportOpen, setIsIntegrityReportOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Distributed Read Trace Modal
  const [readTraceResult, setReadTraceResult] = useState<ReadTraceResult | null>(null);
  const [readTraceObject, setReadTraceObject] = useState<StorageObject | null>(null);

  // Cryptographic Bit-Rot Inspector Modal
  const [inspectBitRotTarget, setInspectBitRotTarget] = useState<{
    object: StorageObject;
    replica: ObjectReplica;
    node: StorageNode;
  } | null>(null);

  // Demo Runner state
  const [demoStep, setDemoStep] = useState<DemoStep>(DEMO_STEPS[0]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isDemoPaused, setIsDemoPaused] = useState(false);

  useEffect(() => {
    const unsubVault = vaultEngine.subscribe((state) => {
      setVaultState({ ...state });
    });

    const unsubDemo = demoRunner.subscribe((step, running, paused) => {
      setDemoStep(step);
      setIsDemoRunning(running);
      setIsDemoPaused(paused);
      if (running) {
        setIsDemoModalOpen(true);
      }
    });

    return () => {
      unsubVault();
      unsubDemo();
    };
  }, []);

  // Handlers
  const handleOpenUpload = () => setIsUploadOpen(true);

  const handleStartDemo = () => {
    setActiveTab('dashboard');
    setIsDemoModalOpen(true);
    demoRunner.startDemo();
  };

  const handleUploadCommit = async (params: {
    fileName: string;
    fileSizeMB: number;
    mimeType: string;
    replicationFactor: number;
    description: string;
  }) => {
    await vaultEngine.uploadObject(params);
  };

  const handleReadObject = (objectId: string) => {
    const trace = vaultEngine.traceReadObject(objectId);
    const obj = vaultState.objects.find((o) => o.objectId === objectId) || null;
    setReadTraceResult(trace);
    setReadTraceObject(obj);
    vaultEngine.readObject(objectId);
  };

  const handleInspectBitRot = (objectId: string, nodeId: string) => {
    const obj = vaultState.objects.find((o) => o.objectId === objectId);
    const rep = vaultState.replicas.find((r) => r.objectId === objectId && r.nodeId === nodeId);
    const node = vaultState.nodes.find((n) => n.id === nodeId);
    if (obj && rep && node) {
      setInspectBitRotTarget({ object: obj, replica: rep, node });
    }
  };

  const handleRepairFromBitRotModal = (objectId: string, nodeId: string) => {
    vaultEngine.repairCorruptedReplica(objectId, nodeId);
    setInspectBitRotTarget(null);
  };

  const handleCorruptReplica = (objectId: string, nodeId: string) => {
    vaultEngine.corruptReplica(objectId, nodeId);
    handleInspectBitRot(objectId, nodeId);
  };

  const handleUpdateVersion = (objectId: string) => {
    vaultEngine.updateObjectVersion(objectId);
  };

  const handleDeleteObject = (objectId: string) => {
    vaultEngine.deleteObject(objectId);
  };

  const handleFailNode = (nodeId: string) => {
    vaultEngine.failNode(nodeId);
  };

  const handleRestartNode = (nodeId: string) => {
    vaultEngine.restartNode(nodeId);
  };

  const handlePartitionNode = (nodeId: string) => {
    vaultEngine.partitionNode(nodeId);
  };

  const handleRestoreNetwork = (nodeId: string) => {
    vaultEngine.restoreNetwork(nodeId);
  };

  const handleRebalance = () => {
    vaultEngine.rebalanceCluster();
  };

  const handleRunIntegrityCheck = () => {
    vaultEngine.runIntegrityCheck();
    setIsIntegrityReportOpen(true);
  };

  const handleSimulateTraffic = () => {
    vaultEngine.simulateTrafficBurst();
  };

  const handleResetCluster = () => {
    vaultEngine.resetCluster();
  };

  const handleTriggerDisaster = (scenarioId: 'SINGLE_FAIL' | 'DOUBLE_FAIL' | 'BIT_ROT' | 'PARTITION_RACK' | 'HIGH_SKEW' | 'READ_STORM') => {
    vaultEngine.triggerDisasterScenario(scenarioId);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#25252D] flex flex-col justify-between selection:bg-[#6C63FF]/20 selection:text-[#6C63FF]">
      {/* Main Container */}
      <div className="w-full flex flex-col flex-1">
        {/* Claymorphic Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          metrics={vaultState.metrics}
          onOpenUpload={handleOpenUpload}
          onStartDemo={handleStartDemo}
          isDemoRunning={isDemoRunning}
        />

        {/* Guided Live Demo HUD */}
        <LiveDemoPresentationHUD
          isOpen={isDemoModalOpen}
          onClose={() => {
            setIsDemoModalOpen(false);
            demoRunner.stopDemo();
          }}
          currentStep={demoStep}
          isRunning={isDemoRunning}
          isPaused={isDemoPaused}
          onPause={() => demoRunner.pauseDemo()}
          onResume={() => demoRunner.resumeDemo()}
          onNext={() => demoRunner.nextStep()}
          onPrev={() => demoRunner.prevStep()}
          onRestart={() => demoRunner.startDemo()}
        />

        <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-8 flex-1">
          {/* TAB 1: DASHBOARD (Home) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Friendly Hero with centerpiece visual explanation */}
              <LandingHero
                onOpenVault={() => setActiveTab('dashboard')}
                onRunLiveDemo={handleStartDemo}
                onOpenUpload={handleOpenUpload}
                onOpenChaos={() => setActiveTab('chaos')}
              />

              {/* 3 Simple Steps Explainer */}
              <SimpleStepsExplainer />

              {/* High-level Cluster Stats */}
              <ClusterStats
                metrics={vaultState.metrics}
                selectedPolicy={vaultState.selectedPolicy}
                onSelectPolicy={(p) => vaultEngine.setDurabilityPolicy(p)}
                isAutoRepairEnabled={vaultState.isAutoRepairEnabled}
                onToggleAutoRepair={() => vaultEngine.toggleAutoRepair()}
              />

              {/* Cluster Map Topology */}
              <ClusterMap
                nodes={vaultState.nodes}
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                activeTransfers={vaultState.activeTransfers}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onFailNode={handleFailNode}
                onRestartNode={handleRestartNode}
                onPartitionNode={handlePartitionNode}
                onRestoreNetwork={handleRestoreNetwork}
                onInspectBitRot={handleInspectBitRot}
              />

              {/* Object Explorer with Trace Reading */}
              <ObjectExplorer
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                nodes={vaultState.nodes}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onReadObject={handleReadObject}
                onViewMetadata={(obj) => setViewMetadataObject(obj)}
                onCorruptReplica={handleCorruptReplica}
                onInspectBitRot={handleInspectBitRot}
                onUpdateVersion={handleUpdateVersion}
                onDeleteObject={handleDeleteObject}
              />

              {/* Chaos Lab Testing Suite */}
              <ChaosLab
                nodes={vaultState.nodes}
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                onFailNode={handleFailNode}
                onRestartNode={handleRestartNode}
                onPartitionNode={handlePartitionNode}
                onRestoreNetwork={handleRestoreNetwork}
                onCorruptReplica={handleCorruptReplica}
                onRebalance={handleRebalance}
                onRunIntegrityCheck={handleRunIntegrityCheck}
                onSimulateTraffic={handleSimulateTraffic}
                onResetCluster={handleResetCluster}
                onTriggerDisaster={handleTriggerDisaster}
              />

              {/* 2-Column: Explainability Engine & Live Event Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExplainabilityPanel explanations={vaultState.explanations} />
                <LiveEventStream events={vaultState.events} />
              </div>
            </div>
          )}

          {/* TAB 2: FILES (Object Explorer) */}
          {activeTab === 'objects' && (
            <div className="space-y-6">
              <ObjectExplorer
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                nodes={vaultState.nodes}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onReadObject={handleReadObject}
                onViewMetadata={(obj) => setViewMetadataObject(obj)}
                onCorruptReplica={handleCorruptReplica}
                onInspectBitRot={handleInspectBitRot}
                onUpdateVersion={handleUpdateVersion}
                onDeleteObject={handleDeleteObject}
              />
              <LiveEventStream events={vaultState.events} />
            </div>
          )}

          {/* TAB 3: STORAGE SERVERS (Node Fleet) */}
          {activeTab === 'nodes' && (
            <div className="space-y-6">
              <ClusterMap
                nodes={vaultState.nodes}
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                activeTransfers={vaultState.activeTransfers}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onFailNode={handleFailNode}
                onRestartNode={handleRestartNode}
                onPartitionNode={handlePartitionNode}
                onRestoreNetwork={handleRestoreNetwork}
                onInspectBitRot={handleInspectBitRot}
              />
              <NodeFleet
                nodes={vaultState.nodes}
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                onFailNode={handleFailNode}
                onRestartNode={handleRestartNode}
                onPartitionNode={handlePartitionNode}
                onRestoreNetwork={handleRestoreNetwork}
                onSelectObject={setSelectedObjectId}
              />
            </div>
          )}

          {/* TAB 4: ACTIVITY (Events & Explanations) */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <ExplainabilityPanel explanations={vaultState.explanations} />
              <LiveEventStream events={vaultState.events} />
            </div>
          )}

          {/* TAB 5: CHAOS LAB */}
          {activeTab === 'chaos' && (
            <div className="space-y-6">
              <ChaosLab
                nodes={vaultState.nodes}
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                onFailNode={handleFailNode}
                onRestartNode={handleRestartNode}
                onPartitionNode={handlePartitionNode}
                onRestoreNetwork={handleRestoreNetwork}
                onCorruptReplica={handleCorruptReplica}
                onRebalance={handleRebalance}
                onRunIntegrityCheck={handleRunIntegrityCheck}
                onSimulateTraffic={handleSimulateTraffic}
                onResetCluster={handleResetCluster}
                onTriggerDisaster={handleTriggerDisaster}
              />
              <ClusterMap
                nodes={vaultState.nodes}
                objects={vaultState.objects}
                replicas={vaultState.replicas}
                activeTransfers={vaultState.activeTransfers}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onFailNode={handleFailNode}
                onRestartNode={handleRestartNode}
                onPartitionNode={handlePartitionNode}
                onRestoreNetwork={handleRestoreNetwork}
                onInspectBitRot={handleInspectBitRot}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExplainabilityPanel explanations={vaultState.explanations} />
                <LiveEventStream events={vaultState.events} />
              </div>
            </div>
          )}

          {/* TAB 6: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <ArchitectureView />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadObjectModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadCommit}
        defaultPolicy={vaultState.selectedPolicy}
      />

      <MetadataViewerModal
        object={viewMetadataObject}
        replicas={vaultState.replicas}
        nodes={vaultState.nodes}
        onClose={() => setViewMetadataObject(null)}
      />

      <IntegrityReportModal
        isOpen={isIntegrityReportOpen}
        report={vaultState.lastIntegrityReport}
        onClose={() => setIsIntegrityReportOpen(false)}
      />

      <ReadFailoverTraceModal
        trace={readTraceResult}
        object={readTraceObject}
        onClose={() => {
          setReadTraceResult(null);
          setReadTraceObject(null);
        }}
      />

      <ChecksumBitRotModal
        object={inspectBitRotTarget?.object || null}
        replica={inspectBitRotTarget?.replica || null}
        node={inspectBitRotTarget?.node || null}
        onClose={() => setInspectBitRotTarget(null)}
        onRepair={handleRepairFromBitRotModal}
      />

      {/* Friendly Claymorphic Footer */}
      <footer className="border-t border-[#E6E2DA] bg-[#FAF8F5] py-6 px-4 lg:px-8 mt-12 text-xs text-[#777784]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#25252D]">VAULT</span>
            <span>·</span>
            <span>Fault-Tolerant Distributed Object Storage</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span>SHA-256 Checksums</span>
            <span>·</span>
            <span>Multi-Copy Replication</span>
            <span>·</span>
            <span className="text-[#3FA97E] font-bold">Zero Data Loss</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
