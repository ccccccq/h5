var str="qwertyuiooiuytrewqab";
var obj={};
for(var i=0;i<str.length;i++){
    obj[str[i]]="1";
}
arr=Object.keys(obj);
var arr_=[];
for(var i in arr ){
    var count=0;
    for(var j=0;j<str.length;j++){
        if(str[j]==arr[i])
        {count++;}
    }
    arr_.push(count);}

var num=0;
for(i in arr_){
    if(arr_[i] != 1){
        num++;
    }
    else break
}
console.log(arr[num])