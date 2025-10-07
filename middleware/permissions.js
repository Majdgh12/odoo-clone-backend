// middleware/permissions.js
export const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
};
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Forbidden - admin only" });
};
// manager of department
export const isManagerOfDepartment = (departmentIdParamName = "departmentId") => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.role === "admin") return next();
    // manager: must have role manager and same department
    if (user.role === "manager" && String(user.department_id) === String(req.params[departmentIdParamName] || req.body.department_id)) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden - must be department manager" });
  };
};
// team lead or manager for project
export const canEditProject = async (ProjectModel) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.role === "admin") return next();
    const projectId = req.params.id ?? req.params.projectId;
    if (!projectId) return res.status(400).json({ message: "Missing project id" });
    const project = await ProjectModel.findById(projectId).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });
    // manager who owns department
    if (user.role === "manager" && String(project.department_id) === String(user.department_id)) return next();
    // team lead
    if (user.role === "team_lead" && String(project.team_lead_id) === String(user._id)) return next();
    return res.status(403).json({ message: "Forbidden - not allowed to edit this project" });
  };
};