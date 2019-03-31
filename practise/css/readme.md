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

行间样式 1000 >id 100>class=属性 10 >标签 1 >通配符 0

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

5.属性选择器  

[id] {
}

[id="only"]{}
```
2.复杂选择器

```
1.父子选择器/派生 
div span

2.直接子元素选择器

3.并列选择器 

标签.class    &nbsp;&nbsp;  &nbsp;  div.demo 

4.分组选择器

共用一个样式
 
em,

strong,

span{
}

```




