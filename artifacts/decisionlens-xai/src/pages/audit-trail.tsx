import React, { useState, useMemo } from 'react';
import { useGetAuditLogs, getGetAuditLogsQueryKey } from '@workspace/api-client-react';
import { ShieldCheck, Search, Clock, FileText, User, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

export function AuditTrailPage() {
  const auditQuery = useGetAuditLogs({
    query: {
      queryKey: getGetAuditLogsQueryKey(),
      staleTime: 30000,
    },
  });

  const [search, setSearch] = useState('');

  const logs = useMemo(() => {
    const data = auditQuery.data ?? [];
    return data.filter(
      (log) =>
        log.scenarioName.toLowerCase().includes(search.toLowerCase()) ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.modelVersion.toLowerCase().includes(search.toLowerCase())
    );
  }, [auditQuery.data, search]);

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="dl-content">
      <div className="dl-heading-row">
        <div>
          <div className="dl-eyebrow">Immutable Governance Log</div>
          <h1 className="dl-page-title">
            Enterprise Decision<br />
            <em>Audit Trail.</em>
          </h1>
          <p className="dl-page-lede">
            Every analysis run, model evaluation, and parameter submission is cryptographically recorded
            to satisfy regulatory compliance, internal accountability, and post-launch review.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="dl-history-controls">
        <div className="dl-search">
          <Search size={15} />
          <input
            className="dl-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by scenario, actor, or model version..."
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="dl-panel dl-history-table">
        <div className="dl-table-head" style={{ gridTemplateColumns: 'minmax(200px, 2fr) 1.2fr 100px 140px 140px' }}>
          <span>Scenario &amp; Action</span>
          <span>Model Version &amp; Actor</span>
          <span>Score</span>
          <span>Recommendation</span>
          <span>Timestamp</span>
        </div>

        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="dl-table-row"
              style={{ gridTemplateColumns: 'minmax(200px, 2fr) 1.2fr 100px 140px 140px' }}
            >
              <div>
                <Link
                  href={`/analysis/${log.decisionId}`}
                  style={{ fontWeight: 700, color: '#173142', textDecoration: 'none' }}
                >
                  {log.scenarioName}
                </Link>
                <div style={{ color: '#889893', fontSize: '10px', marginTop: '3px' }}>
                  Event: {log.action} · ID: {log.id}
                </div>
              </div>

              <div>
                <div style={{ font: '600 11px var(--app-font-mono)', color: '#2c827d' }}>
                  {log.modelVersion}
                </div>
                <div style={{ fontSize: '10px', color: '#6e807b', marginTop: '2px' }}>
                  Actor: {log.actor}
                </div>
              </div>

              <div style={{ font: '600 15px var(--app-font-serif)' }}>{log.overallScore}/100</div>

              <div>
                <span
                  className={`dl-pill ${
                    log.recommendation === 'proceed'
                      ? 'proceed'
                      : log.recommendation === 'guardrails'
                        ? 'guardrails'
                        : 'rework'
                  }`}
                >
                  {log.recommendation}
                </span>
              </div>

              <div style={{ color: '#859690', fontSize: '11px' }}>{formatDate(log.timestamp)}</div>
            </div>
          ))
        ) : (
          <div className="dl-empty">
            <ShieldCheck size={28} color="#2c827d" style={{ margin: '0 auto 10px' }} />
            <strong>No audit events found.</strong>
            <div>Run scenarios to populate the immutable governance trail.</div>
          </div>
        )}
      </div>
    </div>
  );
}
