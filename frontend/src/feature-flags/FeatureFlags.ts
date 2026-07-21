export interface FeatureFlags {
  enableMockMode: boolean;
  enableAuthentication: boolean;
  enableEmailSending: boolean;
  enableExamInvitations: boolean;
  enableFocusMonitoring: boolean;
  enableAutoTermination: boolean;
  enableWebcamMonitoring: boolean;
  enableMicrophoneMonitoring: boolean;
  enableAIQuestionGeneration: boolean;
  enableAIEvaluation: boolean;
  enableSSO: boolean;
  enableLDAP: boolean;
  enableAuditLog: boolean;
  enableNotifications: boolean;
  enableCertificates: boolean;
  enableCandidateRanking: boolean;
  enableCompetencyRecommendations: boolean;
  enableAdvancedDashboard: boolean;
  enableUndoActions: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  enableMockMode: false,
  enableAuthentication: true,
  enableEmailSending: false,
  enableExamInvitations: false,
  enableFocusMonitoring: true,
  enableAutoTermination: true,
  enableWebcamMonitoring: false,
  enableMicrophoneMonitoring: false,
  enableAIQuestionGeneration: false,
  enableAIEvaluation: false,
  enableSSO: false,
  enableLDAP: false,
  enableAuditLog: false,
  enableNotifications: false,
  enableCertificates: false,
  enableCandidateRanking: false,
  enableCompetencyRecommendations: false,
  enableAdvancedDashboard: false,
  enableUndoActions: false,
};
