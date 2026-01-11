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
  getProjectsWithProgressByUserId,
  getProjectById,
  getProjectBySlug,
  updateProjectStatus,
  updateProjectDeploySlug,
  updateProjectName,
  updateProjectBrandConfig,
  deleteProject,
  getProjectWithProgress,
} from './projects'

// Sections
export {
  createSectionsFromTemplate,
  getSectionsByProjectId,
  getSectionById,
  updateSectionOrderBySectionIds,
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
  updateBuildDeployStatus,
} from './builds'
