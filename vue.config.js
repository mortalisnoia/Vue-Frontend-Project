module.exports = {
    configureWebpack: {
        devServer: {
            proxy: 'http://localhost:3000',
        }
    }
}