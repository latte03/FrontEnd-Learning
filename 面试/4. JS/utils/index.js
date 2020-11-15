export function verifyType(obj, type) {
  const getType = Function.prototype.call.bind(Object.prototype.toString);
  return getType(obj) === `[object ${type}]`;
}
