// Simple unique ID generator
export const getUniqueId = (student) => {
  return student.id || `${student.name}-${student.roll}-${student.adm}`;
};