<template>
    <div class="vc-ckeditor">
        <!-- ckeditor dom node -->
        <!-- edit mode -->
        <div :id="domId" v-if="isEdit"></div>
        <!-- preview mode -->
        <div v-else v-html="transferFileUrl" class="preview-text inner-label ckEditor-content"></div>
        <!-- 使用dropzone上传图片 -->
        <uploadByDropzone v-show="false" ref="imgUploader" :schema="dropzoneImageSchema" :model="model"
            :isEditorUpload="true"></uploadByDropzone>
        <!-- 使用dropzone上传文件 -->
        <uploadByDropzone v-show="false" ref="fileUploader" :schema="dropzoneFileSchema" :model="model"
            :isEditorUpload="true">
        </uploadByDropzone>

        <!-- 二维码弹框 -->
        <qrCode ref="qr" @insertQR="insertQR"></qrCode>
    </div>
</template>

<script>
import base from "../utils/form-base";
import pathTrans from "../../utils/transUrl";
import qrCode from "../qrCode.vue";
export default {
    name: 'vc-ckeditor',
    mixins: [base],
    components: {
        uploadByDropzone: () => import("./vc-dropzone.vue"),
        qrCode
    },
    data() {
        return {
            domId: `cke${Date.now()}`,
            curEditor: null,
            allFileIds: [],
            fileIcon: this.$store.getters.cdnHostAndVersionPath + '/static/Content/Images/',
            dropzoneImageSchema: {
                "name": this.schema.model,
                "model": this.schema.model.toLowerCase() + "-uploadImageByDropzone" + "_" + this.$dm_getGuid(),
                "component": "vc-dropzone",
                "enablePdf": false,
                "show": true,
                "direction": "level",
                "disableLabel": true,
                "maxFiles": 1,
                "acceptedFiles": "image/gif,image/jpeg,image/jpg,image/bmp,image/png,image/tif,image/tiff",
                "uploadByDropzone": true,
            },
            dropzoneFileSchema: {
                "name": this.schema.model,
                "model": this.schema.model.toLowerCase() + "-uploadByDropzone" + "_" + this.$dm_getGuid(),
                "component": "vc-dropzone",
                "enablePdf": false,
                "show": true,
                "direction": "level",
                "disableLabel": true,
                "maxFiles": 1,
                "acceptedFiles": null,
                "uploadByDropzone": true,
            },
            editorConfig: {
                // https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html#extended-toolbar-configuration-format
                toolbar: {
                    items: this.schema.selectedItems,
                    // items: [
                    //     'undo', 'redo',
                    //     '|', 'heading',
                    //     '|', 'bold', 'italic', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
                    //     '|', 'alignment', 'bulletedList', 'numberedList', 'outdent', 'indent',
                    //     '|', 'blockQuote', 'link', 'insertTable', 'customImgLoader', 'customFileLoader',
                    //     '|', 'customExportDoc', 'CustomExportPdf', 'sourceEditing',
                    // ],
                    shouldNotGroupWhenFull: true
                },
                // Changing the language of the interface requires loading the language file using the <script> tag.
                language: this.$i18n.locale === 'zh-tw' ? 'zh' : this.$i18n.locale,
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true
                    }
                },
                // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
                heading: {
                    options: [
                        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
                    ]
                },
                // https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html#using-the-editor-configuration
                placeholder: '',
                // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
                fontFamily: {
                    options: [
                        "黑体",
                        "仿宋",
                        "楷体",
                        "标楷体",
                        "华文仿宋",
                        "华文楷体",
                        "宋体",
                        "微软雅黑",
                        "Arial",
                        "Tahoma",
                        "Verdana",
                        "Times New Roman",
                        "Courier New",
                        "Open Sans",
                        "SourceHanSansCN",
                    ],
                    supportAllValues: true
                },
                // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
                fontSize: {
                    options: this.schema.fontSizeList.sort((a, b) => a - b),
                    supportAllValues: true
                },
                // Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
                // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
                htmlSupport: {
                    allow: [
                        {
                            name: /.*/,
                            attributes: true,
                            classes: true,
                            styles: true
                        }
                    ]
                },
                // Be careful with enabling previews
                // https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html#content-previews
                htmlEmbed: {
                    showPreviews: true
                },
                // https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators
                link: {
                    decorators: {
                        addTargetToExternalLinks: true,
                        defaultProtocol: 'https://',
                        toggleDownloadable: {
                            mode: 'manual',
                            label: 'Downloadable',
                            attributes: {
                                download: 'file'
                            }
                        }
                    }
                },

            }
        }
    },
    computed: {
        transferFileUrl() {
            return this.formatValue(this.value);
        },
    },
    provide: function () {
        return {
            EditorManager: {
                // 注入到dropzone组件中，这样可以在子组件中直接调用父组件的方法
                InsertResource: this.InsertResource
            }
        }
    },
    mounted() {
        // 自定义按钮绑定处理函数
        window.handleUploadImage = this.handleUploadImage
        window.handleUploadFile = this.handleUploadFile
        window.handleExportDoc = this.handleExportDoc
        window.handleExportPdf = this.handleExportPdf
        window.handleInsertQRCode = this.handleInsertQRCode
        // 新建函数队列，只初始化一次
        if (!window.funcStack) window.funcStack = []
        // 插入脚本
        this.insertScript()
    },
    methods: {
        formatValue(val) {
            let originName = window.location.origin + pathTrans('/api/DownloadFile?');
            let cdnHostAndVersionPath = this.fileIcon;
            return (val != undefined && val.length > 0) ? val.replace(/src="\/api\/DownloadFile\?/ig, 'src="' + originName)
                .replace(/src="\/static\/scripts\/ckeditor\/fileTypeImages\//ig, 'src="' + cdnHostAndVersionPath)
                .replace(/href="\/api\/DownloadFile\?/ig, 'href="' + originName)
                : '';
        },
        // 加载打包后的ckeditor,包括了必要的插件
        insertScript() {
            // 每次都push进初始化函数到队列
            window.funcStack.push(this.initCKEditor)
            // 如果还没加载脚本
            if (!document.querySelector('.ckEditorScript')) {
                let scriptDom = document.createElement('script')
                scriptDom.src = this.$store.getters.cdnHostAndVersionPath + "/static/scripts/ckeditor/ckeditor.js"
                scriptDom.classList.add('ckEditorScript')
                document.head.appendChild(scriptDom)
                // 脚本加载后，在执行队列里，挨个初始化CKEditor
                scriptDom.onload = () => {
                    window.funcStack.forEach(func => func())
                }
            }
        },
        // 初始化CKEditor
        initCKEditor() {
            // 根据全局配置对象，初始化编辑器实例
            ClassicEditor.create(document.getElementById(this.domId), this.editorConfig).then(editor => {
                // 缓存当前实例
                this.curEditor = editor
                // 注入编辑页面数据
                editor.setData(this.value)
                //监听数据变化
                editor.model.document.on('change:data', () => {
                    this.value = editor.getData()
                });
            }).catch(error => {
                console.error(error);
            });
        },
        // 切换语言
        changeLang(lang) {
            let _lang = lang === 'zh-tw' ? 'zh' : lang
            // 缓存编辑器已输入的内容
            let savedData = this.curEditor.getData()
            // 设置语言
            this.editorConfig.language = _lang;
            // 重新创建编辑器实例
            this.curEditor.destroy()
                .then(() => ClassicEditor.create(document.getElementById(this.domId), this.editorConfig))
                .then(newEditor => {
                    this.curEditor = newEditor
                    newEditor.setData(savedData)
                })
                .catch(error => console.error(error));
        },
        // 插入图片实际执行的函数      
        handleUploadImage(editor) {
            // 将从ckeditor.js内部自定义按钮传入的editor实例赋值给curEditor
            this.curEditor = editor
            this.$refs.imgUploader.manuallyAddFileByEditor()
        },
        // 插入文件实际执行的函数      
        handleUploadFile(editor) {
            // 将从ckeditor.js内部自定义按钮传入的editor实例赋值给curEditor
            this.curEditor = editor
            this.$refs.fileUploader.manuallyAddFileByEditor()
        },
        // 导出word文档实际执行的函数      
        handleExportDoc(editor) {
            // 将从ckeditor.js内部自定义按钮传入的editor实例赋值给curEditor
            this.curEditor = editor
            // 以下逻辑来源于（已重构）：
            // SourceCode\PwC.AppMaker\ClientApp\Common\editor\editorEvent.js
            this.$store.state.loading = true;
            let contents = editor.getData();
            // ckeditor已经把图片地址转义了，从源头上替换掉转义字符
            contents = contents.replaceAll(/amp;/g, '')
            if (contents != null && contents != '') {
                const cdnPath = this.$store.getters.cdnHostAndVersionPath || window.location.host || '';
                contents = contents.replaceAll(`src="/static`, `src="https://${cdnPath}/static`);
                let preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
                let postHtml = "</body></html>";
                const imgReg = /img.*?src=".*?"/g
                const srcReg = RegExp('src=".*?"')
                const matchImgs = contents.match(imgReg);
                let promiseList = [];
                if (matchImgs != null) {
                    matchImgs.forEach((element) => {
                        let imgSrc = element.match(srcReg)[0] || ''
                        imgSrc = imgSrc.replace('src="', '').replace('"', '')
                        if (imgSrc != '' && imgSrc.includes('http')) {
                            promiseList.push(this.getBase64(imgSrc))
                        }
                    });
                }
                if (promiseList.length > 0) {
                    Promise.all(promiseList).then(proResult => {
                        proResult.forEach(imgItem => {
                            contents = contents.replace(imgItem.url, imgItem.base64)
                        })
                        this.downloadWord(preHtml + contents + postHtml)
                    }).finally(() => {
                        this.$store.state.loading = false;
                    })
                } else {
                    this.downloadWord(preHtml + contents + postHtml)
                    this.$store.state.loading = false;
                }
            } else {
                this.$store.state.loading = false;
            }
        },
        // 图片地址转图片base64
        getBase64(imgUrl) {
            return new Promise(function (resolve, reject) {
                window.URL = window.URL || window.webkitURL;
                let xhr = new XMLHttpRequest();
                xhr.open("get", imgUrl, true);
                xhr.responseType = "blob";
                xhr.onload = function () {
                    if (this.status == 200) {
                        let blob = this.response;
                        let oFileReader = new FileReader();
                        oFileReader.onloadend = function (e) {
                            let base64 = e.target.result;
                            resolve({ url: imgUrl, base64: base64 })
                        };
                        oFileReader.readAsDataURL(blob);
                    }
                }
                xhr.send();
            })
        },
        // 下载word文档
        downloadWord(html) {
            const stateData = this.$store.state;
            const tenantId = stateData.userInfo.tenantId;
            const appCode = stateData.appInfo.AppCode;
            let blob = new Blob(['\ufeff', html], {
                type: 'application/msword'
            });
            let downloadLink = 'data:application/vnd.ms-word;charset=uft-8,' + encodeURIComponent(html);
            const dateNow = Date.now();
            let fileName = `${tenantId}_${appCode}_${dateNow}.doc`;
            const downA = document.createElement('a');
            downA.download = fileName;
            downA.style.display = 'none';
            downA.href = downloadLink;
            downA.id = `a_word_${dateNow}`;
            document.body.appendChild(downA);
            if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                downA.click();
            }
            document.body.removeChild(downA)
        },
        // 导出pdf实际执行的函数      
        handleExportPdf(editor) {
            // 将从ckeditor.js内部自定义按钮传入的editor实例赋值给curEditor
            this.curEditor = editor
            // 以下逻辑来源于（已重构）：
            // SourceCode\PwC.AppMaker\ClientApp\Common\editor\editorEvent.js
            this.$store.state.loading = true;
            this.$axios.post('/api/dgqEditorConvertPDF', {
                contents: editor.getData(),
                tenantId: this.$store.state.userInfo.tenantId,
                appCode: this.$store.state.appInfo.AppCode,
                responseType: 'blob'
            }).then(e => {
                if (e != null) {
                    let fileName = e.headers['content-disposition'].split('=')[1]
                    const downloadUrl = window.URL.createObjectURL(new Blob([e.data]));
                    const link = document.createElement('a');
                    fileName = fileName.substring(0, fileName.indexOf('.pdf') + 4)
                    link.download = fileName
                    link.href = downloadUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                this.$store.state.loading = false;
            })
        },
        getFileIcon(ext) {
            var maps = {
                "doc": "doc.svg",
                "docx": "docx.svg",
                "xls": "xls.svg",
                "xlsx": "xlsx.svg",
                "ppt": "ppt.svg",
                "pptx": "pptx.svg",
                "psd": "psd.svg",
                "pdf": "pdf.svg",
                "bmp": "bmp.svg",
                "csv": "csv.svg",
                "gif": "gif.svg",
                "html": "html.svg",
                "jpeg": "jpeg.svg",
                "jpg": "jpeg.svg",
                "png": "png.svg",
                "tiff": "tiff.svg",
                "vsdx": "vsdx.svg",
                "file": "file.svg",
            };
            return maps[ext] ? maps[ext] : maps['file'];
        },
        InsertResource(uploadResult) {
            console.log(uploadResult)
            if (!this.allFileIds.includes(uploadResult.fileId)) {
                this.allFileIds.push(uploadResult.fileId);
            }
            var extension = uploadResult.fileName.substr(uploadResult.fileName.lastIndexOf(".") + 1).toLowerCase();
            let _src = window.location.origin + pathTrans(uploadResult.imgUrl)

            // 插入图片地址
            if ("jpg,png,svg,jpeg,gif,bmp".indexOf(extension) != -1) {
                this.curEditor.model.change(writer => {
                    const imageElement = '<figure class="image">' +
                        '<img src="' + _src + '" alt="' + uploadResult.fileName + '" data-href="' + _src + '"/>' +
                        '</figure>'
                    const viewFragment = this.curEditor.data.processor.toView(imageElement);
                    const modelFragment = this.curEditor.data.toModel(viewFragment);
                    this.curEditor.model.insertContent(modelFragment, this.curEditor.model.document.selection.getFirstPosition());

                });
            } else {
                // 插入文件图标和文件名称                
                let icon = this.fileIcon + 'Fileicon/' + this.getFileIcon(extension);
                var fileUrl = window.location.origin + pathTrans(uploadResult.url);
                var content = `
                    <figure class="p">
                    <img alt="" class="imgDemo" src="${icon}">                   
                        <a href="${fileUrl}" class="imgDemo" style="vertical-align: super;">
                        ${uploadResult.fileName}
                        </a>                    
                    </figure>`
                const viewFragment = this.curEditor.data.processor.toView(content);
                const modelFragment = this.curEditor.data.toModel(viewFragment);
                this.curEditor.model.insertContent(modelFragment, this.curEditor.model.document.selection.getFirstPosition());
            }
            this.$store.state.loading = false;
        },
        handleInsertQRCode(thisEditor) {
            // 这里的 thisEditor 是ckeditor.js中封装的二维码插件里面，传过来的
            // 这里必须赋值给curEditor，否则下方插入二维码的时候，this.curEditor指向不对
            this.curEditor = thisEditor
            this.$refs.qr.showDialog()
        },
        insertQR(src) {
            this.curEditor.model.change(writer => {
                const imageElement = '<figure class="image">' +
                    '<img src="' + src + '" />' +
                    '</figure>'
                const viewFragment = this.curEditor.data.processor.toView(imageElement);
                const modelFragment = this.curEditor.data.toModel(viewFragment);
                this.curEditor.model.insertContent(modelFragment, this.curEditor.model.document.selection.getFirstPosition());
            });
        }
    },
    watch: {
        "$i18n.locale": function (n, o) {
            if (n !== o) this.changeLang(n)
        }
    },
} 
</script>

<style lang="scss" scoped>
.vc-ckeditor::v-deep .ck.ck-balloon-panel.ck-powered-by-balloon[class*=position_border] {
    display: none; // 隐藏右下角poweredby标识
}

.vc-ckeditor::v-deep .ck-content {
    min-height: 400px;
    max-height: 500px;
}
</style>