// while(line = readline()){
//     var lines =line.split(" ");
//     var ind=0;
//     var arr=[];
//     var listNew="";
//     var stringNew = "" ;
//     var index = lines[0].indexOf(lines[1]);
//     if(index != -1){
//         for(var i=0;i<lines[0].length;i++){
//             arr[i]=line[ind];
//             ind++;
//         }
//         for(var i=0;i<lines[1].length;i++){
//             arr[index] = "*";
//             index++;
//         }
//         stringNew =listNew.concat(arr);
//         for(var i=0;i<stringNew.length;i++){
//             var StringNew = stringNew.replace(",","");
//             stringNew=StringNew;
//         }
//         print(stringNew);
//     }
//     else{
//         print(lines[0]);
//     }
// }
function insertSort(){
    var arr = [2,5,1,4,7];
    var Cut ;
    for(var i = 1;i<arr.length;i++){
        Cut = i;
        for(var j=i-1;j>=0;j--){
          if(arr[Cut]<arr[j]){
              temp = arr[Cut];
              arr[Cut] = arr[j];
              arr[j] = temp;
              Cut = j;
          }
        }
        console.log(arr);

    }
    console.log(arr);
}
function shellSort (){
   var arr=[2,5,1,4,7];
   for(var gap=arr.length/2;gap>0;gap=gap/2){
       for(var m=0;m<arr.length;m++){
           if(m % gap==1){
               for(var i = 1;i<arr.length;i++){
                   Cut = i;
                   for(var j=i-1;j>=0;j--){
                       if(arr[Cut]<arr[j]){
                           temp = arr[Cut];
                           arr[Cut] = arr[j];
                           arr[j] = temp;
                           Cut = j;
                       }
                   }
               }
           }
       }
   }
    console.log(arr);
}
function mergeSort(){
    var arr=[2,5,1,4,7];
    var times= Math.ceil(arr.length/4+1);
    for(var j = 1;i<=times;j++) {
        if(times=1) {
            for (var i = 0; i < arr.length; i = i + 2) {
                if (a[i] > a[i + 1]) {
                    temp = a[i];
                    a[i] = a[i + 1];
                    a[i + 1] = temp;
                }
            }
        }

        console.log(arr);
    }
   console.log(arr);
}

function splitString(string1){
     return string1.split('');
}
function kuohao(){
    (window.foo || (window.foo='abd'));
    return window.foo;
}















