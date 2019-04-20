
function mytypeof(target){
    var ret=typeof(target);
    var deobj={
        "[object Object]":"object",
        "[object Array]":"array",
        "[object Number]":"number-object",
        "[object Boolean]":"Boolean-object",
        "[object String]":"String-object"
    }

    if(target===null)
    {return "null";}

    if(ret=="object")
    {
        var str=Object.prototype.toString.call(target);
        return deobj[str];
    }
    else
    {return ret;}


}