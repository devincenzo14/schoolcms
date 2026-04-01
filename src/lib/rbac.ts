export type Role = "admin" | "principal" | "teacher" | "student";

export type Resource =
  | "carousel"
  | "programs"
  | "gallery"
  | "announcements"
  | "users"
  | "applications"
  | "grades"
  | "classes"
  | "about"
  | "testimonials";

export type Action = "create" | "read" | "update" | "delete";

const permissions: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    carousel: ["create", "read", "update", "delete"],
    programs: ["create", "read", "update", "delete"],
    gallery: ["create", "read", "update", "delete"],
    announcements: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    applications: ["create", "read", "update", "delete"],
    grades: ["create", "read", "update", "delete"],
    classes: ["create", "read", "update", "delete"],
    about: ["create", "read", "update", "delete"],
    testimonials: ["create", "read", "update", "delete"],
  },
  principal: {
    carousel: ["create", "read", "update"],
    programs: ["create", "read", "update"],
    gallery: ["create", "read", "delete"],
    announcements: ["create", "read", "update"],
    users: ["read"],
    applications: ["read", "update"],
    grades: ["read"],
    classes: ["read"],
    about: ["read"],
    testimonials: ["read"],
  },
  teacher: {
    carousel: ["read"],
    programs: ["create", "read", "update"],
    gallery: ["create", "read"],
    announcements: ["create", "read", "update"],
    users: [],
    applications: [],
    grades: ["create", "read", "update", "delete"],
    classes: ["read"],
    about: [],
    testimonials: [],
  },
  student: {
    carousel: [],
    programs: [],
    gallery: [],
    announcements: ["read"],
    users: [],
    applications: [],
    grades: ["read"],
    classes: ["read"],
    about: [],
    testimonials: [],
  },
};

export function checkPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  return permissions[role]?.[resource]?.includes(action) ?? false;
}

export function getAccessibleResources(role: Role): Resource[] {
  return Object.entries(permissions[role] || {})
    .filter(([, actions]) => actions.length > 0)
    .map(([resource]) => resource as Resource);
}
