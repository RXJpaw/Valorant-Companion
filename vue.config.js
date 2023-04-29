const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
    outputDir: path.join(__dirname, 'dist_vue'),
    transpileDependencies: true,
    productionSourceMap: false,
    configureWebpack: (config) => {
        config.devtool = 'source-map'
    },
    chainWebpack: (config) => {
        config.module //
            .rule('images')
            .set('parser', {
                dataUrlCondition: {
                    maxSize: -1
                }
            })
    }
})
