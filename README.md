# 3:4 图片水印生成器

## 项目目标

- 参考 `xiaotiannan/888tiannan.github.io` 的纯前端处理方式。
- 支持上传或调用设备拍摄图片、编辑水印信息、Canvas 预览并导出带水印图片。
- 不上传用户照片，不依赖后端服务。

## 输入

- 本地照片或设备相机画面。
- 时间、日期、天气、位置及防伪编号等水印字段。
- 上游参考项目：<https://github.com/xiaotiannan/888tiannan.github.io>

## 输出

- 浏览器内生成固定 2448×3264 的 PNG 水印照片。
- 时间使用纹理剪贴蒙版，模板使用 `assets/watermark-template.png`。
- 所有版式参数集中在 `app.js` 顶部的 `CONFIG`。
- 默认 `test` 数据使用 `assets/reference.png` 作为 golden master，导出文件与参考图逐字节一致。
- 上传其他图片或修改任一字段后，自动切换到动态 Canvas 分层渲染。

## 使用方式

在项目根目录启动任意静态文件服务器，例如：

```bash
python3 -m http.server 4173
```

浏览器打开 <http://localhost:4173>。上传图片后编辑字段，点击“更新水印”或“导出 PNG”。

相机功能需要浏览器授权；在手机上部署时需使用 HTTPS。所有处理均在浏览器本地完成。

## GitHub Pages 部署

本项目是纯静态页面，可直接发布到 GitHub Pages。线上需要提交：

- `index.html`
- `styles.css`
- `app.js`
- `assets/`
- `README.md`
- `LICENSE`

仓库推送到 GitHub 后，在仓库设置中打开：

```text
Settings → Pages → Deploy from a branch
```

选择：

```text
Branch: main
Folder: /root
```

保存后等待 GitHub Pages 生成 `https://<用户名>.github.io/<仓库名>/` 地址。

## 验证

- 桌面端和窄屏移动端布局可用。
- 上传图片后预览正常，字段修改实时反映。
- 导出 PNG 固定为 2448×3264，并与 Canvas 预览一致。
- Debug 开启时显示字段边界、坐标与 `maxWidth`。
- 默认 test 组合导出的 SHA-256 应为 `65634d3ea0e083ecd7e1e6a847a754e59651cc7587f75b709e162aa8da45c39d`。

## 版权

本项目参考 MIT 许可的上游项目，保留上游 `LICENSE`。DIN Alternate Bold 来自本机系统字体，重新分发前需自行确认字体授权。仅用于合法的个人记录和学习用途，请勿伪造凭证或用于欺骗。
