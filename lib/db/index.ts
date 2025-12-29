// =============================================================================
// DATABASE HELPERS - BARREL EXPORT
// =============================================================================

// Users
export {
  getOrCreateUser,
  getUserByClerkId,
  getUserById,
  checkAndIncrementGeneration,
  getGenerationCount,
} from './users'

// Projects
export {
  createProject,
  getProjectsByUserId,
  getProjectById,
  getProjectBySlug,
  updateProjectStatus,
  updateProjectName,
  deleteProject,
  getProjectWithProgress,
} from './projects'

// Sections
export {
  createSectionsFromTemplate,
  getSectionsByProjectId,
  getSectionById,
  markSectionBuilding,
  completeSection,
  updateSectionRefinement,
  skipSection,
  resetSection,
  getSectionStats,
} from './sections'

// Builds
export {
  assembleSectionsIntoCode,
  createBuild,
  getLatestBuild,
  getBuildById,
  getBuildsByProjectId,
  updateBuildAudit,
  updateBuildDeployment,
} from './builds'
