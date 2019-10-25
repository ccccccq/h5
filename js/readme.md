1.var let const  的区别 

```
1.let添加了快级作用域.var中块内定义的变量，块外仍然可见。
2.约束变量提升。var声明有预编译，但是let必须按照代码执行的顺序执行。
3.暂时性死区。如果块内存在let命令，那么这个块就会成为一个封闭的作用域，并要求let变量先声明才能使用，如果在声明之前就开始使用，它并不会引用外部的变量。
4.let禁止重复声明变量。
5.let是独立存在的变量，不会成为全局对象的属性。不像暗示全局变量，能够直接变成window的属性。而是独立的。


const 和let 的这些特点都一致。但是const必须先在声明时初始化，而且不能重新赋值。
```
2.解构赋值（惰性求值）
```
function rel(){
return 2;}
var [a=rel(),b=1,c=2]=[];
当右边没有赋值，为undefined时，才会执行rel();
能够节省性能

var&let
   
   var [a=b,b=2]=[];
   console.log(a);
   console.log(b);
    
    var a=b; //a=b=undefined;
    var b=1;  //b=1;
    
   let [a=b,b=1]=[];
   console.log(a);
   console.log(b);
   
   let a=b;//没有变量提升，所以报错
   let b=1;
  
var a;
({a}={a:1});      //添加括号，告诉js引擎这是一个表达式，而不是一个块。
    
```
3.
      