/*
 * @Author: Agan
 * @Date: 2020-10-30 10:24:17
 * @LastEditors: Agan
 * @LastEditTime: 2020-10-30 14:18:59
 * @Description:
 */

// 获取数据类型
function getType(obj) {
  const typeString = Function.prototype.call.bind(Object.prototype.toString)(
    obj
  );
  return typeString.substring(8, typeString.length - 1);
}
// 获取最大高度
function getMaxHeight(array) {
  let maxHeight = 0;
  array.forEach((element) => {
    if (element > maxHeight) maxHeight = element;
  });
  return maxHeight;
}
// 获取正数，可以设置默认值
function getPositiveNumber(number, def) {
  return number < 0 ? (def ? def : 0) : number;
}

function trap(height) {
  if (lenght === 0) return 0;

  let total = 0;

  for (let i = 0; i < lenght; i++) {
    const leftMax = getMaxHeight(height.slice(0, i));
    const rightMax = getMaxHeight(height.slice(i + 1, lenght));
    total += getPositiveNumber(Math.min(leftMax, rightMax) - height[i]);
  }
  return total;
}

function trap(height) {
  let total = 0;
  let left = 0,
    right = height.length - 1,
    leftMax = 0,
    rightMax = 0;
  while (left <= right) {
    leftMax = Math.max(leftMax, height[left]);
    rightMax = Math.max(rightMax, height[right]);
    if (leftMax < rightMax) {
      total += leftMax - height[left];
      left++;
    } else {
      total += rightMax - height[right];
      right--;
    }
  }
  return total;
}
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]));
