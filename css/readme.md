#css
cascading style sheet 层叠样式表

引入：
```
1.行间样式
<div style="  ">

2.页面级css
< head >
    < style >
  
         这里写
     </style>
</head>

3.外部css文件
<link rel="stylesheet" href=" ">
```
#加载 
异步加载==同时加载

当浏览器加载html文件时，逐步加载，遇到需要加载的css时，则再开一个线程，进行异步加载。

#选择器
**1.简单选择器**

行间样式 1000 >id 100>class=属性 10 >标签 1 通配符 0

权重最大 !imporant infinity  正无穷 

256进制


```
1.id选择器,一一对应     


2.class,一个系列。 

.class

如果一个系列中需要有不一样的地方，可以  class="class class1"

3.标签选择器  

比如所有的div

4.通配符    
" * "
可以初始化各种标签 
5.属性选择器  

[id] {
}

[id="only"]{}
```
2.复杂选择器

```
1.父子选择器/派生 
div span
所有的儿子孙子

2.直接子元素选择器
只能选儿子，不能选孙子

3.并列选择器 

标签.class    div.demo 

4.分组选择器

共用一个样式
 
em,

strong,

span{
}
5.伪类选择器 
a:hover 

```

#font
```
font-size :12px
font-weight :字体粗细，分为norol bold bolder light <integer>具体数字 100 -900
font-style :字体样式，italic 斜体
font-family:字体，arial 乔布斯发明
color :设置字体颜色 1.纯英文单词 2.颜色代码 #ffffff 3.颜色编码 color:rgb( , , ) 
```

#text
```border:border-width border-style boerder-color; 

border-style： dotted（实心） bolid（点状虚线） dashed （条状虚线）

 text-align: left;   对齐方式：左中右 
 line-height:20px; 单行文本高度
             求1.2倍行高     line-height：1.2em;
             单行文本居中：   line-height=height
 text-indent:2em;       首行缩进
 text-decoration:line-through;中划线
                 underline 下划线
cursor 光标  ：鼠标移上去的形状 point  小手
              help 问号
              
vertical-align 一行元素的对其线
```
              
 #盒子模型
 ```三大部分 盒子壁       border
内边距       padding
盒子内容     width+height content
外边距       margin
         
padding  :上右下左
padding-left 
三个值  上，固定左右两个 ，下
两个值 先上下，后左右    
 ```
#层模型 position
```
1.position:absolute（定位）  脱离原来位置进行定位 ，在不同的层面
相对于最近的有定位的父级进行定位，如果没有，那么相对于文档进行定位
left：10px
right：
top：
button：

body 自带一个8px 的margin


2.relative（参照物）
保留原来位置进行定位,相对于自己原来的位置进行定位。

3.fixed

```
#BFC
```父子组合的元素 ,垂直方向margin 取最大的值
解决办法：
BFC block format context 块级格式化上下文

触发bfc，
1. position：absolute;
2. display:inline-block;
3. float:left/right;
4. overflow:hidden; //改变父级，溢出部分隐藏
```


#float
````
站队
浮动元素产生了浮动流
1.所有产生了浮动流的元素，块级元素看不到他们
2.产生了bfc的元素和文本类（inline）属性的元素和文本能看到浮动元素
加了p元素，用p元素清除浮动。
clear： left,right,both 清除周边浮动流.只要块级元素！
`````

#伪元素
```
没有html 结构，可以被css修饰
天生行级元素
span::before
span::after

content：""  内容

.wraper::after {
content:"";
display:block;
clear:both;}
```****



#文本溢出
```
1.单行文本
三件套：
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;

2.多行文本
截断
overflow:hidden;
```
#放图片
````
background-image:url();
background-size: px px;
background-repeat:repeat/no-repeat/repeat-x/repeat-y
background-position:left center 
                       50% 50% 
`````
#套规则
行级元素只能套行级元素，块级元素可以套任何元素
p标签内不能套块元素
a标签内不能套a标签

#继承
可继承的属性：font-size, font-family, color

不可继承的样式：border, padding, margin, width, height