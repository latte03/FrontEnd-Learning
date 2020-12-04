# React Native

环境搭建过程跟着官网教程走

- [React Native 中文文档](https://www.reactnative.cn/docs/getting-started)
- [React Native 官方英文](https://reactnative.dev/docs/getting-started)
- 官方推荐的导航组件目前新版本是5.x版本 [React Navigation](https://reactnavigation.org/docs/getting-started)

## 标签

### View

- 相当于web中的div
- 不支持设置字体大小，字体颜色
- 不能直接访文本
- 不支持直接绑定点击事件


### Text

- 文本标签，设置字体和颜色
- 支持绑定点击事件


### TouchableOpacity

可以绑定点击事件的块级标签

- 相当于块级的容器
- 支持绑定点击事件`onPress`
- 可以设置点击时的透明度

  ```jsx
  <TouchableOpacity activeOpacity={0.5} onPress={this.handleOnPress} />
  ```

### Image

- Uri 引入的图片需要设定宽高，否则无法渲染（理解为：先渲染的image组件，但是么有内容，无法撑开组件，默认为0，0，即使是动态加载了图片但不再渲染）
- 默认下Android不支持GIf和webP的格式，GIF不会动，需要在`android/app/build.gradle`文件中手动添加模块

### ImageBackground

- style 属性是必填的可以为空

### TextInput

- 通过onChangeText 事件来获取输入框的值

## 注意点

- RN中样式是不继承的
- 没有px，vw，vh等单位，但是可以百分比，相对父级

RN提供了一个方法 获取屏幕宽高

```jsx

import { Dimensions } from 'react-native';
const screenWidth = Math.round(Dimensions.get('window').width)
const screenHeight = Math.round(Dimensions.get('window').height)
```

### transform属性

样式中的Transform 接收一个数组，别设置css中的属性对象

```

{
  transform: [
    {scale: 1},
    {translate:'50%'}
    ]
}

```