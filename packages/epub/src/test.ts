import fs from 'node:fs'
import path from 'node:path'
import xml2js from 'xml2js'
import mime from 'mime-types'

function main(

) {
  // 读取 XML 文件
  const xmlContent = fs.readFileSync(path.resolve(__dirname, './part0004.html'), 'utf-8')

  // 使用 xml2js 解析 XML 内容
  const parser = new xml2js.Parser()
  parser.parseString(xmlContent, (err, result) => {
    if (err) {
      console.error(err)
    }
    else {
    // 遍历文档，处理 img 标签
      traverseAndUpdateImages(result)

      // 使用 xml2js 将更新后的 JavaScript 对象转换为 XML
      const builder = new xml2js.Builder()
      const updatedXml = builder.buildObject(result)

      // 将更新后的 XML 写回文件
      fs.writeFileSync('./part0004.html', updatedXml, 'utf-8')
    }
  })
}

// 遍历文档，处理 img 标签
function traverseAndUpdateImages(node) {
  if (node && typeof node === 'object') {
    if (Array.isArray(node)) {
      // 处理数组
      for (const item of node)
        traverseAndUpdateImages(item)
    }
    else {
      // 处理对象
      for (const key in node) {
        if (key === 'img') {
          // 处理 img 标签
          updateImageToBase64(node[key])
        }
        else if (key === 'link' && node[key][0] && node[key][0].$ && node[key][0].$.href) {
          // 处理 link 标签
          updateLinkToBase64(node[key])
        }
        else {
          // 递归处理其他标签
          traverseAndUpdateImages(node[key])
        }
      }
    }
  }
}

// 将 img 标签中的图片转换为 base64
function updateImageToBase64(imgNode) {
  if (imgNode && imgNode[0] && imgNode[0].$ && imgNode[0].$.src) {
    const imageFilePath = path.resolve(__dirname, './00002.jpeg')

    try {
      const imageData = fs.readFileSync(imageFilePath)
      const base64Image = imageData.toString('base64')
      const mimeType = mime.lookup(imageFilePath)

      // 更新 img 标签中的属性
      imgNode[0].$.src = `data:${mimeType};base64,${base64Image}`
    }
    catch (error) {
      console.error(`Error reading image file: ${imageFilePath}`)
    }
  }
}

function updateLinkToBase64(linkNode) {
  if (linkNode && linkNode[0] && linkNode[0].$ && linkNode[0].$.href) {
    const cssPath = linkNode[0].$.href
    const cssFilePath = path.resolve(__dirname, cssPath)

    try {
      const cssData = fs.readFileSync(cssFilePath)
      const base64Css = cssData.toString('base64')
      const mimeType = mime.lookup(cssFilePath)

      // 更新 link 标签中的属性
      linkNode[0].$.href = `data:${mimeType};base64,${base64Css}`
    }
    catch (error) {
      console.error(`Error reading CSS file: ${cssFilePath}`)
    }
  }
}

main()
