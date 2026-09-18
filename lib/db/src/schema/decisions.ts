import { pgTable, text, serial, integer, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const decisionsTable = pgTable("decisions", {
  id: text("id").primaryKey(),
  scenarioName: text("scenario_name").notNull(),
  context: text("context"),
  strategicAlignment: integer("strategic_alignment").notNull(),
  financialReadiness: integer("financial_readiness").notNull(),
  technicalReadiness: integer("technical_readiness").notNull(),
  teamReadiness: integer("team_readiness").notNull(),
  marketEvidence: integer("market_evidence").notNull(),
  riskExposure: integer("risk_exposure").notNull(),
  timelinePressure: integer("timeline_pressure").notNull(),
  recommendation: text("recommendation").notNull(),
  recommendationLabel: text("recommendation_label").notNull(),
  overallScore: integer("overall_score").notNull(),
  confidence: integer("confidence").notNull(),
  confidenceLabel: text("confidence_label").notNull(),
  rationale: text("rationale").notNull(),
  factors: jsonb("factors").notNull(),
  nextSteps: jsonb("next_steps").notNull(),
  counterfactuals: jsonb("counterfactuals"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  decisionId: text("decision_id").notNull(),
  scenarioName: text("scenario_name").notNull(),
  modelVersion: text("model_version").notNull(),
  recommendation: text("recommendation").notNull(),
  overallScore: integer("overall_score").notNull(),
  confidence: integer("confidence").notNull(),
  actor: text("actor").notNull().default("Product Lead"),
  inputSnapshot: jsonb("input_snapshot").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const modelMetricsTable = pgTable("model_metrics", {
  id: serial("id").primaryKey(),
  modelVersion: text("model_version").notNull(),
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).defaultNow().notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  f1Score: doublePrecision("f1_score").notNull(),
  brierScore: doublePrecision("brier_score").notNull(),
  sampleCount: integer("sample_count").notNull(),
  metricsJson: jsonb("metrics_json").notNull(),
});

export const insertDecisionSchema = createInsertSchema(decisionsTable);
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type DecisionRecord = typeof decisionsTable.$inferSelect;

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLogRecord = typeof auditLogsTable.$inferSelect;
