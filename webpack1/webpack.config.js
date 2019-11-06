module.exports = {
    entry:'./src/js/entry.js' ,
    output:{
        filename: 'index.js',
        path: __dirname + '/out',
        publicPath:'./out'
    },
    module:{
        rules:[
            {test:/.js$/,use:'babel-loader'},
            //一个可以用loader,但是两个以上只能用use
            {test:/.css$/,use:['style-loader','css-loader']},
            {test:/.(gif|jpg|svg|png)$/,use:['url-loader?limit=8192&name=/[name].[ext]']},
            {test:/.less$/,use:['style-loader','css-loader','less-loader']}
        ]
    }
}
//如果修改了webpack.config.js文件，不能实时检测到修改，要ctrl+c退出后，再重新进，实时监测