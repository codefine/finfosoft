# Document

<p style="width: 100%; height: 20px; background: black; color: #fff;">test</p>

## class Finfosoft.Ring

**NAME**

环形滚动条

**SUPPORT**

IE9.0及以上浏览器

**OPTIONS**

Name | Type | Description | Default | Arguments
---- | ---- | ----------- | ------- | ---------
`el` | String  | 元素选择器 | - | -
`startDeg` | Number | 起始角度(0度 -> x轴正向)  | - | -
`endDeg` | Number | 结束角度(0度 -> x轴正向)  | - | -
lineWidth | Number | 滚动条宽度  | 20% of ParentClientRect | -
bgColor | String | 滚动条背景色  | '#eeeeee' | -
mainColor | String | 主情景色  | '#66ee66' | -
initVal | Number | 初始数据  | 0 | -

**METHODS**

* `reset()` 重置，回到上次记录值的状态

**Example**

``` js
new Finfosoft.Ring({
    el: '.finfosoft-ring',
    startDeg: 150,
    endDeg: 30,
    lineWidth: 18,
    bgColor: '#eeeeee',
    mainColor: '#66ee66',
    initVal: 20
});
```

## class Finfosoft.OnOff

**NAME**

开关

**SUPPORT**

IE9.0及以上浏览器

**OPTIONS**

Name | Type | Description | Default | Arguments
---- | ---- | ----------- | ------- | ---------
`el` | String  | 元素选择器 | - | -
status | Number | 滚动条宽度  | 0 | -
onChanged | Function | 状态变化后的回调 | - | status

**METHODS**

* `reset()` 重置，回到上次记录值的状态

**Example**

``` js
new Finfosoft.OnOff({
    el: '.finfosoft-onoff',
    status: 1,
    onChanged: function(status) {
        console.log(status);
    }
});
```
