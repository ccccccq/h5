var str="wertyuiopqqwertyuiopacdcfvdcfvs";
var obj={};
for(var i=0;i<str.length;i++){
    obj[str[i]]="1";
}
var arr1=Object.keys(obj);
var arr2=[];
for(i in arr1){
    var count=0;
    for(var j=0;j<str.length;j++)
    {
        if(str[j]==arr1[i]){
            count++;
        }
    }

    arr2.push(count);
}
var num=0;
for(i in arr2){
    if(arr2[i]!=1)
        num++;
    else break;
}
console.log(arr1[num]);